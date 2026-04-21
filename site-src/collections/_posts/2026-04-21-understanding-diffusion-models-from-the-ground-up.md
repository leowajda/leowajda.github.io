---
title: Understanding Diffusion Models From the Ground Up
slug: understanding-diffusion-models-from-the-ground-up
description: A clean derivation of diffusion models from the ELBO to DDPM, DDIM, and a modern Keras implementation.
date: 2026-04-21 00:00:00 +0200
permalink: /writing/understanding-diffusion-models-from-the-ground-up/
needs_math: true
---

Diffusion models are easier to understand once the hype is removed.

Start with one picture: take a clean image, corrupt it a little, corrupt it again, keep going until nothing remains except Gaussian noise, then learn how to reverse that chain one step at a time. That is the whole game. The forward corruption process is fixed. The reverse denoising process is learned. Everything else, from the ELBO to DDIM, is machinery built around that one idea.

This post rewrites an earlier thesis and notebook into one corrected narrative. It keeps the original ambition, fixes the mathematical slips, modernizes the implementation, and ties the full chain together: the ELBO, DDPM, DDIM, and a backend-neutral Keras implementation. The goal is simple. By the end, three ideas should feel completely concrete:

1. A diffusion model is a very specific Markovian hierarchical VAE.
2. The reverse process reduces to noise prediction because the forward chain is linear and Gaussian.
3. The whole system can be implemented cleanly in modern Keras without leaning on TensorFlow-specific habits.

## Why diffusion feels different

A GAN tries to jump directly from noise to data in one shot. A diffusion model learns an ordered sequence of small corrections. The price is speed. The reward is stability and a training objective that still looks like probability theory instead of a two-player game.

That framing already tells you why diffusion became so durable. If the forward process is fixed, the model never has to solve the whole generation problem in one unstable leap. It only has to answer a narrower question at each step: given a slightly corrupted sample, what is the next small move toward the data manifold?

## From a VAE to a Markov latent chain

The cleanest entry point is the variational autoencoder.

In a vanilla VAE we introduce a latent variable $z$, define a joint model

$$
p_\theta(x, z) = p_\theta(x \mid z) p(z),
$$

and try to maximize the marginal likelihood $p_\theta(x)$. Directly maximizing $\log p_\theta(x)$ is hard because it requires integrating over all latent configurations, so we introduce an approximate posterior $q_\phi(z \mid x)$ and lower-bound the log evidence:

$$
\log p_\theta(x)
=
\log \int p_\theta(x, z)\,dz
=
\log \int q_\phi(z \mid x)\frac{p_\theta(x, z)}{q_\phi(z \mid x)}\,dz.
$$

Apply Jensen's inequality:

$$
\log p_\theta(x)
\ge
\mathbb E_{q_\phi(z \mid x)}
\left[
\log \frac{p_\theta(x, z)}{q_\phi(z \mid x)}
\right].
$$

That lower bound is the ELBO:

$$
\mathcal L_{\text{ELBO}}
=
\mathbb E_{q_\phi(z \mid x)}[\log p_\theta(x \mid z)]
-
D_{\mathrm{KL}}(q_\phi(z \mid x)\,\|\,p(z)).
$$

The decomposition matters. The first term says reconstruct the input from the latent. The second says keep the approximate posterior close to the prior.

Now replace one latent with a whole chain $z_1, \dots, z_T$. A Markovian hierarchical VAE factorizes as

$$
p_\theta(x, z_{1:T})
=
p(z_T)\,p_\theta(x \mid z_1)\prod_{t=2}^{T} p_\theta(z_{t-1} \mid z_t),
$$

and

$$
q_\phi(z_{1:T} \mid x)
=
q_\phi(z_1 \mid x)\prod_{t=2}^{T} q_\phi(z_t \mid z_{t-1}).
$$

That is already very close to diffusion. The decisive move is to freeze the forward encoder into a simple Gaussian Markov chain and keep every latent in the same space as the data. Relabel the latents as $x_1, \dots, x_T$:

$$
q(x_{1:T} \mid x_0)
=
\prod_{t=1}^{T} q(x_t \mid x_{t-1}),
\qquad
p_\theta(x_{0:T})
=
p(x_T)\prod_{t=1}^{T} p_\theta(x_{t-1} \mid x_t).
$$

Now the encoder is a forward noising process and the decoder is a reverse denoising chain. This is the diffusion view of a Markovian hierarchical VAE.

## DDPM from first principles

### The forward process

DDPM chooses the forward chain to be linear and Gaussian:

$$
q(x_t \mid x_{t-1})
=
\mathcal N\!\left(x_t; \sqrt{1-\beta_t}\,x_{t-1}, \beta_t I\right).
$$

Define

$$
\alpha_t = 1 - \beta_t,
\qquad
\bar\alpha_t = \prod_{s=1}^{t} \alpha_s.
$$

Then the single-step update becomes

$$
x_t = \sqrt{\alpha_t}\,x_{t-1} + \sqrt{1-\alpha_t}\,\epsilon_t,
\qquad
\epsilon_t \sim \mathcal N(0, I).
$$

Unroll the recursion all the way back to $x_0$ and the chain collapses to one closed-form marginal:

$$
x_t
=
\sqrt{\bar\alpha_t}\,x_0
+
\sqrt{1-\bar\alpha_t}\,\epsilon,
\qquad
\epsilon \sim \mathcal N(0, I),
$$

so

$$
q(x_t \mid x_0)
=
\mathcal N\!\left(x_t; \sqrt{\bar\alpha_t}x_0, (1-\bar\alpha_t)I\right).
$$

This identity is the computational backbone of diffusion training. We do not have to simulate the whole forward chain to train on timestep $t$. We can sample $x_t$ from $x_0$ in one shot.

### The exact posterior

The reverse chain is what we want to learn, but the key posterior

$$
q(x_{t-1} \mid x_t, x_0)
$$

is tractable. By Bayes,

$$
q(x_{t-1} \mid x_t, x_0)
\propto
q(x_t \mid x_{t-1}) q(x_{t-1} \mid x_0).
$$

Both terms are Gaussian, so the result is Gaussian too:

$$
q(x_{t-1} \mid x_t, x_0)
=
\mathcal N\!\left(x_{t-1}; \tilde\mu_t(x_t, x_0), \tilde\beta_t I\right),
$$

with

$$
\tilde\beta_t
=
\frac{1-\bar\alpha_{t-1}}{1-\bar\alpha_t}\beta_t,
$$

and

$$
\tilde\mu_t(x_t, x_0)
=
\frac{\sqrt{\bar\alpha_{t-1}}\beta_t}{1-\bar\alpha_t}x_0
+
\frac{\sqrt{\alpha_t}(1-\bar\alpha_{t-1})}{1-\bar\alpha_t}x_t.
$$

This is the moment where diffusion stops feeling magical. The reverse target exists in closed form. The model only has to approximate that Gaussian posterior.

### The reverse model

DDPM chooses a Gaussian reverse process:

$$
p_\theta(x_{t-1} \mid x_t)
=
\mathcal N\!\left(x_{t-1}; \mu_\theta(x_t, t), \Sigma_\theta(x_t, t)\right).
$$

If the covariance is fixed, the timestep-wise KL between the true posterior and the learned reverse model reduces to a weighted squared error in the means. So the learning problem becomes: predict the correct Gaussian mean.

That still leaves one question: what is the best coordinate system for the prediction?

### Why $\epsilon$-prediction is natural

From the forward marginal,

$$
x_t = \sqrt{\bar\alpha_t}x_0 + \sqrt{1-\bar\alpha_t}\epsilon,
$$

we can solve for the clean image:

$$
x_0
=
\frac{x_t - \sqrt{1-\bar\alpha_t}\epsilon}{\sqrt{\bar\alpha_t}}.
$$

Substitute that into the posterior mean and the whole expression collapses to

$$
\tilde\mu_t(x_t, \epsilon)
=
\frac{1}{\sqrt{\alpha_t}}
\left(
x_t - \frac{\beta_t}{\sqrt{1-\bar\alpha_t}}\epsilon
\right).
$$

That is the real reason $\epsilon$-prediction matters. It is not a heuristic. It is an algebraic reparameterization of the reverse mean.

So the model predicts the noise:

$$
\mu_\theta(x_t, t)
=
\frac{1}{\sqrt{\alpha_t}}
\left(
x_t - \frac{\beta_t}{\sqrt{1-\bar\alpha_t}}\epsilon_\theta(x_t, t)
\right).
$$

Plug this into the KL objective and the practical training loss becomes the simplified denoising objective

$$
L_{\text{simple}}
=
\mathbb E_{x_0,\epsilon,t}
\left[
\left\|
\epsilon - \epsilon_\theta
\!\left(
\sqrt{\bar\alpha_t}x_0+\sqrt{1-\bar\alpha_t}\epsilon,\ t
\right)
\right\|^2
\right].
$$

In plain terms: sample a clean image, choose a random timestep, corrupt the image analytically, and ask the network to predict the exact Gaussian noise that was added.

### DDPM sampling

Once the network predicts $\epsilon_\theta(x_t, t)$, sampling uses

$$
x_{t-1}
=
\frac{1}{\sqrt{\alpha_t}}
\left(
x_t - \frac{\beta_t}{\sqrt{1-\bar\alpha_t}}\epsilon_\theta(x_t, t)
\right)
+
\sigma_t z,
\qquad
z \sim \mathcal N(0, I).
$$

Start from

$$
x_T \sim \mathcal N(0, I)
$$

and iterate backward until $x_0$.

## Schedules and DDIM

### Why the schedule matters

The noise schedule is not a detail. It determines how quickly signal is destroyed.

If the chain becomes pure noise too quickly, the model wastes capacity on states that have already lost most structure. If the chain is too gentle, the terminal prior does not approach a standard Gaussian cleanly enough. The schedule controls where the model spends difficulty.

The original DDPM paper used a linear schedule. Later work introduced cosine schedules by defining the cumulative signal level directly:

$$
\bar\alpha_t = \frac{f(t)}{f(0)},
\qquad
f(t)=\cos^2\!\left(
\frac{t/T+s}{1+s}\frac{\pi}{2}
\right).
$$

Then

$$
\beta_t = 1-\frac{\bar\alpha_t}{\bar\alpha_{t-1}}.
$$

The point is not that cosine is magical. The point is that it allocates information destruction more evenly across the chain.

### DDIM

DDPM samples through a stochastic reverse Markov chain. DDIM keeps the same training objective but uses a broader reverse family built around the same marginals $q(x_t \mid x_0)$.

First recover the current clean estimate:

$$
\hat x_0(x_t, t)
=
\frac{x_t - \sqrt{1-\bar\alpha_t}\epsilon_\theta(x_t, t)}{\sqrt{\bar\alpha_t}}.
$$

Then construct the next latent:

$$
x_{t-1}
=
\sqrt{\bar\alpha_{t-1}}\hat x_0
+
\sqrt{1-\bar\alpha_{t-1}-\sigma_t(\eta)^2}\,\epsilon_\theta(x_t, t)
+
\sigma_t(\eta)z,
\qquad
z \sim \mathcal N(0, I),
$$

where

$$
\sigma_t(\eta)
=
\eta
\sqrt{\frac{1-\bar\alpha_{t-1}}{1-\bar\alpha_t}}
\sqrt{1-\frac{\bar\alpha_t}{\bar\alpha_{t-1}}}.
$$

If $\eta = 0$, DDIM becomes deterministic. If $\eta > 0$, it reintroduces stochasticity. That is the whole family. The training target does not change. Only the sampling path changes.

DDIM can also skip timesteps by using a subsequence of the trained horizon. That is where the speedup comes from. The network is not cheaper. We just evaluate it fewer times.

## A clean Keras implementation

The right modern style here is straightforward:

1. Keep the schedule explicit.
2. Use backend-neutral `keras.ops`.
3. Keep timestep conditioning explicit.
4. Train with `fit()` and optimizer EMA instead of a shadow model.
5. Separate training augmentation from validation preprocessing.

### The schedule object

```python
import math
import numpy as np
import keras
from keras import layers, ops


class DiffusionSchedule:
    def __init__(
        self,
        timesteps=1000,
        beta_start=1e-4,
        beta_end=2e-2,
        schedule="linear",
        cosine_s=0.008,
        max_beta=0.999,
    ):
        self.timesteps = timesteps

        if schedule == "linear":
            betas = np.linspace(beta_start, beta_end, timesteps, dtype="float32")
        elif schedule == "cosine":
            def f(i):
                return math.cos(((i / timesteps) + cosine_s) / (1.0 + cosine_s) * math.pi / 2.0) ** 2

            betas = []
            for i in range(timesteps):
                alpha_bar_prev = f(i)
                alpha_bar_next = f(i + 1)
                betas.append(min(1.0 - alpha_bar_next / alpha_bar_prev, max_beta))
            betas = np.asarray(betas, dtype="float32")
        else:
            raise ValueError(f"Unknown schedule: {schedule}")

        alphas = 1.0 - betas
        alpha_bar = np.cumprod(alphas, axis=0)
        alpha_bar_prev = np.concatenate([[1.0], alpha_bar[:-1]], axis=0)

        self.betas = betas
        self.alphas = alphas
        self.alpha_bar = alpha_bar.astype("float32")
        self.alpha_bar_prev = alpha_bar_prev.astype("float32")
        self.sqrt_alpha_bar = np.sqrt(alpha_bar).astype("float32")
        self.sqrt_one_minus_alpha_bar = np.sqrt(1.0 - alpha_bar).astype("float32")
        self.posterior_variance = (
            betas * (1.0 - alpha_bar_prev) / (1.0 - alpha_bar)
        ).astype("float32")


def extract(arr_1d, t, ref):
    values = ops.take(ops.convert_to_tensor(arr_1d), t, axis=0)
    return ops.reshape(values, (-1,) + (1,) * (len(ref.shape) - 1))
```

This object deserves to live near the top of the implementation because nearly every later equation is just a lookup into these arrays.

### Timestep embeddings

The network needs both the noisy image $x_t$ and the timestep $t$. A sinusoidal embedding is the clean standard choice:

```python
class SinusoidalTimeEmbedding(layers.Layer):
    def __init__(self, dim, max_period=10_000, **kwargs):
        super().__init__(**kwargs)
        self.dim = dim
        self.max_period = max_period

    def call(self, t):
        t = ops.cast(t, "float32")
        half = self.dim // 2
        freqs = ops.arange(half, dtype="float32")
        freqs = ops.exp(-math.log(self.max_period) * freqs / max(half - 1, 1))
        angles = ops.expand_dims(t, -1) * ops.expand_dims(freqs, 0)
        emb = ops.concatenate([ops.sin(angles), ops.cos(angles)], axis=-1)
        if self.dim % 2 == 1:
            emb = ops.pad(emb, [[0, 0], [0, 1]])
        return emb
```

Denoising at step 50 and denoising at step 900 are not the same problem. The model only works if it sees that difference explicitly.

### Residual blocks and the U-Net

Residual blocks fit denoising well because the network repeatedly learns small corrections rather than entirely new representations.

```python
def residual_block(x, temb, out_channels, groups=8):
    in_channels = x.shape[-1]

    h = layers.GroupNormalization(groups=groups)(x)
    h = layers.Activation("swish")(h)
    h = layers.Conv2D(out_channels, 3, padding="same")(h)

    t_proj = layers.Activation("swish")(temb)
    t_proj = layers.Dense(out_channels)(t_proj)
    t_proj = layers.Reshape((1, 1, out_channels))(t_proj)
    h = layers.Add()([h, t_proj])

    h = layers.GroupNormalization(groups=groups)(h)
    h = layers.Activation("swish")(h)
    h = layers.Conv2D(out_channels, 3, padding="same")(h)

    if in_channels != out_channels:
        x = layers.Conv2D(out_channels, 1, padding="same")(x)

    return layers.Add()([x, h])
```

A U-Net is then the obvious backbone. The down path collects global context. The up path restores detail. Skip connections preserve local structure that would otherwise vanish.

```python
def build_unet(
    image_size=64,
    channels=3,
    base_channels=64,
    channel_mults=(1, 2, 3, 4),
    num_res_blocks=2,
    time_dim=256,
):
    noisy_image = keras.Input((image_size, image_size, channels), name="noisy_image")
    timestep = keras.Input((), dtype="int32", name="timestep")

    temb = SinusoidalTimeEmbedding(time_dim)(timestep)
    temb = layers.Dense(time_dim * 4, activation="swish")(temb)
    temb = layers.Dense(time_dim)(temb)

    x = layers.Conv2D(base_channels, 3, padding="same")(noisy_image)
    skips = []

    for level, mult in enumerate(channel_mults):
        out_channels = base_channels * mult
        for _ in range(num_res_blocks):
            x = residual_block(x, temb, out_channels)
            skips.append(x)
        if level != len(channel_mults) - 1:
            x = layers.Conv2D(out_channels, 3, strides=2, padding="same")(x)
            skips.append(x)

    x = residual_block(x, temb, base_channels * channel_mults[-1])
    x = residual_block(x, temb, base_channels * channel_mults[-1])

    for level, mult in reversed(list(enumerate(channel_mults))):
        out_channels = base_channels * mult
        for _ in range(num_res_blocks + 1):
            x = layers.Concatenate()([x, skips.pop()])
            x = residual_block(x, temb, out_channels)
        if level != 0:
            x = layers.UpSampling2D(size=2, interpolation="nearest")(x)
            x = layers.Conv2D(out_channels, 3, padding="same")(x)

    x = layers.GroupNormalization(groups=8)(x)
    x = layers.Activation("swish")(x)
    pred_noise = layers.Conv2D(channels, 3, padding="same")(x)

    return keras.Model(
        inputs={"noisy_image": noisy_image, "timestep": timestep},
        outputs=pred_noise,
        name="epsilon_unet",
    )
```

### Training pairs

The network does not consume clean images directly. It consumes $(x_t, t)$ and predicts the exact noise used to create $x_t$.

```python
class DiffusionPairs(keras.utils.PyDataset):
    def __init__(self, images, schedule, batch_size=64, augment=False, seed=1337):
        super().__init__()
        self.images = np.asarray(images, dtype="float32")
        self.schedule = schedule
        self.batch_size = batch_size
        self.augment = augment
        self.rng = np.random.default_rng(seed)

    def __len__(self):
        return math.ceil(len(self.images) / self.batch_size)

    def __getitem__(self, idx):
        batch = self.images[idx * self.batch_size : (idx + 1) * self.batch_size].copy()

        if self.augment:
            flips = self.rng.random(len(batch)) < 0.5
            batch[flips] = batch[flips, :, ::-1, :]

        t = self.rng.integers(
            low=0,
            high=self.schedule.timesteps,
            size=(len(batch),),
            dtype=np.int32,
        )
        noise = self.rng.standard_normal(batch.shape).astype("float32")

        alpha_bar = self.schedule.alpha_bar[t][:, None, None, None].astype("float32")
        noisy = np.sqrt(alpha_bar) * batch + np.sqrt(1.0 - alpha_bar) * noise

        return {"noisy_image": noisy, "timestep": t}, noise
```

Two details matter here. Augmentation belongs in training, not validation. And timesteps are sampled uniformly by default, which matches the practical objective.

### Optimizer EMA

The clean modern version uses optimizer EMA rather than manually maintaining a shadow copy of the model.

```python
schedule = DiffusionSchedule(timesteps=1000, schedule="linear")
model = build_unet(image_size=64, channels=3)

optimizer = keras.optimizers.Adam(
    learning_rate=1e-4,
    use_ema=True,
    ema_momentum=0.999,
)

model.compile(
    optimizer=optimizer,
    loss=keras.losses.MeanSquaredError(),
)

train_data = DiffusionPairs(train_images, schedule, batch_size=64, augment=True)
val_data = DiffusionPairs(val_images, schedule, batch_size=64, augment=False)

history = model.fit(
    train_data,
    validation_data=val_data,
    epochs=600,
    callbacks=[
        keras.callbacks.SwapEMAWeights(),
        keras.callbacks.ModelCheckpoint("best.keras", save_best_only=True),
        keras.callbacks.CSVLogger("training.csv"),
    ],
)
```

EMA matters because diffusion training is noisy in both senses: SGD is noisy and the model itself is trying to predict noise. Averaged weights often generate cleaner samples than the raw latest checkpoint.

### DDPM and DDIM samplers

```python
class Sampler:
    def __init__(self, model, schedule, seed=2024):
        self.model = model
        self.schedule = schedule
        self.seed_gen = keras.random.SeedGenerator(seed)

    def predict_x0(self, x_t, t):
        pred_noise = self.model({"noisy_image": x_t, "timestep": t}, training=False)
        sqrt_alpha_bar_t = extract(self.schedule.sqrt_alpha_bar, t, x_t)
        sqrt_one_minus_alpha_bar_t = extract(self.schedule.sqrt_one_minus_alpha_bar, t, x_t)
        x0 = (x_t - sqrt_one_minus_alpha_bar_t * pred_noise) / sqrt_alpha_bar_t
        return x0, pred_noise

    def ddpm_step(self, x_t, t):
        beta_t = extract(self.schedule.betas, t, x_t)
        alpha_t = extract(self.schedule.alphas, t, x_t)
        alpha_bar_t = extract(self.schedule.alpha_bar, t, x_t)
        posterior_var_t = extract(self.schedule.posterior_variance, t, x_t)

        _, pred_noise = self.predict_x0(x_t, t)
        mean = (x_t - beta_t / ops.sqrt(1.0 - alpha_bar_t) * pred_noise) / ops.sqrt(alpha_t)

        z = keras.random.normal(ops.shape(x_t), seed=self.seed_gen)
        nonzero = ops.cast(ops.expand_dims(t > 0, (-1, -1, -1)), x_t.dtype)
        return mean + nonzero * ops.sqrt(posterior_var_t) * z

    def ddim_step(self, x_t, t, t_prev, eta=0.0):
        alpha_bar_t = extract(self.schedule.alpha_bar, t, x_t)
        alpha_bar_prev = extract(self.schedule.alpha_bar_prev, t, x_t)

        x0, pred_noise = self.predict_x0(x_t, t)

        sigma_t = (
            eta
            * ops.sqrt((1.0 - alpha_bar_prev) / (1.0 - alpha_bar_t))
            * ops.sqrt(1.0 - alpha_bar_t / alpha_bar_prev)
        )

        direction = ops.sqrt(1.0 - alpha_bar_prev - ops.square(sigma_t)) * pred_noise
        z = keras.random.normal(ops.shape(x_t), seed=self.seed_gen)
        return ops.sqrt(alpha_bar_prev) * x0 + direction + sigma_t * z
```

The important conceptual point is simple. DDPM gives you the conservative stochastic sampler. DDIM gives you a deterministic or semi-stochastic family that can skip timesteps and run much faster.

## How to read the project results

On a small dataset and a single-GPU budget, sample grids matter as much as scalar metrics. Noise-prediction loss can flatten before image quality is truly good. KID can improve while local structure remains weak. The right reading is joint:

1. training loss tells you whether the denoising task is being learned at all
2. KID tells you whether generated features are moving toward the real distribution
3. sample grids tell you whether the model is learning coherent geometry instead of colored blur

The strongest result in the project was the linear DDPM run with EMA weights. The cleanest lesson from the comparisons was that EMA mattered a lot, and that deterministic fast sampling exposed weaknesses faster than the slower stochastic reverse chain.

When the project figures are exported cleanly, they should live under `/assets/images/diffusion/` and be inserted in this section. The directory is already reserved for that purpose.

## What matters most

Once the pieces are placed in the right order, diffusion models stop feeling mysterious.

Start with the ELBO. Freeze the forward process into a linear Gaussian chain. Use the exact posterior to turn reverse modeling into Gaussian mean prediction. Reparameterize the mean as noise prediction. Pick a schedule that destroys information at a sensible rate. Use a timestep-conditioned U-Net as the denoiser. Then choose DDPM if you want the conservative stochastic path or DDIM if you want a faster deterministic family.

That is the whole construction. It is a probabilistic latent-variable model with an unusually practical implementation.

## References

Diederik P. Kingma and Max Welling. *An Introduction to Variational Autoencoders.* Foundations and Trends in Machine Learning, 2019.

Jascha Sohl-Dickstein, Eric Weiss, Niru Maheswaranathan, and Surya Ganguli. *Deep Unsupervised Learning Using Nonequilibrium Thermodynamics.* 2015.

Jonathan Ho, Ajay Jain, and Pieter Abbeel. *Denoising Diffusion Probabilistic Models.* 2020.

Alex Nichol and Prafulla Dhariwal. *Improved Denoising Diffusion Probabilistic Models.* 2021.

Jiaming Song, Chenlin Meng, and Stefano Ermon. *Denoising Diffusion Implicit Models.* 2020.

Olaf Ronneberger, Philipp Fischer, and Thomas Brox. *U-Net: Convolutional Networks for Biomedical Image Segmentation.* 2015.
