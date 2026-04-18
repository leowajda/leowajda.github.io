---
problem_slug: sqrtx
problem_title: Sqrt(x)
problem_source_url: https://leetcode.com/problems/sqrtx
implementation_id: cpp-iterative
language: cpp
language_label: C++
approach: iterative
approach_label: Iterative
title: Sqrt(x) · C++ Iterative
description: Sqrt(x) solution in C++ using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/cpp/src/math/iterative/Sqrtx.cpp
code_language: cpp
detail_url: "/eureka/problems/sqrtx/#cpp-iterative"
embed_url: "/eureka/problems/sqrtx/embed/cpp-iterative/"
project_slug: eureka
---

~~~cpp
#include <algorithm>
#include <ranges>

class Sqrtx {
 public:
  constexpr int mySqrt(const int x) const noexcept {
    const auto range = std::views::iota(0LL, static_cast<long long>(x) + 1);
    const auto it = std::ranges::partition_point(range, [x](long long val) { return val * val <= x; });
    return static_cast<int>(*it - 1);
  }
};
~~~
