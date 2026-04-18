---
problem_slug: find-smallest-letter-greater-than-target
problem_title: Find Smallest Letter Greater Than Target
problem_source_url: https://leetcode.com/problems/find-smallest-letter-greater-than-target
implementation_id: cpp-iterative
language: cpp
language_label: C++
approach: iterative
approach_label: Iterative
title: Find Smallest Letter Greater Than Target · C++ Iterative
description: Find Smallest Letter Greater Than Target solution in C++ using the iterative
  approach.
source_url: https://github.com/leowajda/eureka/blob/master/cpp/src/array/iterative/FindSmallestLetterGreaterThanTarget.cpp
code_language: cpp
detail_url: "/eureka/problems/find-smallest-letter-greater-than-target/#cpp-iterative"
embed_url: "/eureka/problems/find-smallest-letter-greater-than-target/embed/cpp-iterative/"
project_slug: eureka
---

~~~cpp
#include <algorithm>
#include <vector>

class Solution {
 public:
  constexpr char nextGreatestLetter(const std::vector<char>& letters, const char target) const noexcept {
    const auto it = std::ranges::upper_bound(letters, target);
    return it != letters.cend() ? *it : letters.front();
  }
};
~~~
