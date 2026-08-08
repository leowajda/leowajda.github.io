# frozen_string_literal: true

require 'test_helper'

module SiteKit
  module Core
    class ResourcePathsTest < Minitest::Test
      def setup
        @paths = ResourcePaths.new(route_base: '/eureka')
      end

      def test_path_and_embed
        assert_equal '/eureka/', @paths.root
        assert_equal '/eureka/problems/', @paths.path('problems')
        assert_equal '/eureka/problems/two-sum/', @paths.path('problems', 'two-sum')
        assert_equal '/eureka/problems/two-sum/embed/', @paths.embed('problems', 'two-sum')
      end

      def test_with_fragment
        assert_equal '/eureka/problems/two-sum/#java-iterative',
                     @paths.with_fragment('/eureka/problems/two-sum/', 'java-iterative')
        assert_equal '/eureka/problems/two-sum/',
                     @paths.with_fragment('/eureka/problems/two-sum/', '')
      end
    end
  end
end
