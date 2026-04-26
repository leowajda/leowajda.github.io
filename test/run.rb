# frozen_string_literal: true

Dir[File.join(__dir__, '**/*_test.rb')].each do |path|
  require path
end
