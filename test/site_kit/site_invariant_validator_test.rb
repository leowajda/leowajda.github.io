# frozen_string_literal: true

require_relative '../test_helper'

class SiteKitSiteInvariantValidatorTest < SiteKitTestCase
  def test_validates_generated_urls_and_hidden_pages
    site = generated_site

    assert_silent do
      SiteKit::SiteInvariantValidator.new(site: site).validate!
    end

    generated_urls = site.pages.grep(SiteKit::GeneratedPage).map(&:url)

    assert_equal generated_urls.uniq.size, generated_urls.size
    assert(site.pages.grep(SiteKit::GeneratedPage).all? { |page| page.data['layout'] })
    assert(site.pages.grep(SiteKit::GeneratedPage)
                        .select { |page| page.data['layout'] == 'redirect' || page.data['noindex'] == true || page.data['layout'] == 'problem_embed' }
      .all? { |page| page.data['sitemap'] == false })
  end
end
