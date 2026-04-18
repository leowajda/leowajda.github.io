---
problem_slug: find-first-and-last-position-of-element-in-sorted-array
problem_title: Find First and Last Position of Element in Sorted Array
problem_source_url: https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array
implementation_id: cpp-iterative
language: cpp
language_label: C++
approach: iterative
approach_label: Iterative
title: Find First and Last Position of Element in Sorted Array · C++ Iterative
description: Find First and Last Position of Element in Sorted Array solution in C++
  using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/cpp/src/array/iterative/FindFirstAndLastPositionOfElementInSortedArray.cpp
code_language: cpp
detail_url: "/eureka/problems/find-first-and-last-position-of-element-in-sorted-array/#cpp-iterative"
embed_url: "/eureka/problems/find-first-and-last-position-of-element-in-sorted-array/embed/cpp-iterative/"
project_slug: eureka
---

~~~cpp
#include <algorithm>
#include <vector>

class Solution {
 public:
  constexpr std::vector<int> searchRange(const std::vector<int>& nums, const int target) const noexcept {
    const auto [first, last] = std::ranges::equal_range(nums, target);
    const auto offset = nums.cbegin();
    if (first == last)
      return {-1, -1};
    return {static_cast<int>(first - offset), static_cast<int>(std::prev(last) - offset)};
  }
};
~~~
