# frozen_string_literal: true

require_relative '../../lib/site_kit'

Jekyll::Hooks.register :site, :after_reset do |site|
  SiteKit::BuildContext.clear(site)
end
