---
problem_slug: binary-search
problem_title: Binary Search
problem_source_url: https://leetcode.com/problems/binary-search
implementation_id: cpp-iterative
language: cpp
language_label: C++
approach: iterative
approach_label: Iterative
title: Binary Search · C++ Iterative
description: Binary Search solution in C++ using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/cpp/src/array/iterative/BinarySearch.cpp
code_language: cpp
detail_url: "/eureka/problems/binary-search/#cpp-iterative"
embed_url: "/eureka/problems/binary-search/embed/cpp-iterative/"
project_slug: eureka
---

~~~cpp
#include <algorithm>
#include <vector>

class BinarySearch {
 public:
  constexpr int search(const std::vector<int>& nums, const int target) const noexcept {
    const auto it = std::ranges::lower_bound(nums, target);
    return it != nums.cend() && *it == target ? static_cast<int>(it - nums.cbegin()) : -1;
  }
};
~~~
