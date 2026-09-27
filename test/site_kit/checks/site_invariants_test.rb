# frozen_string_literal: true

require_relative '../../test_helper'

class SiteKitSiteInvariantValidatorTest < SiteKitTestCase
  def test_validates_generated_urls_and_hidden_pages
    site = generated_site

    assert_silent do
      SiteKit::Checks::SiteInvariants.new(site: site).validate!
    end

    generated = SiteKit::Checks::SiteInvariants.new(site: site).send(:generated_pages)
    generated_urls = generated.map(&:url)

    assert_predicate generated, :any?
    assert_equal generated_urls.uniq.size, generated_urls.size
    assert(generated.all? { |page| page.data['layout'] })
    assert(generated
      .select { |page| page.data['noindex'] == true || page.data['layout'] == 'code_embed' }
      .all? { |page| page.data['sitemap'] == false })
  end
end
