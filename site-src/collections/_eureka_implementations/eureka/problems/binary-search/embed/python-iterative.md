---
problem_slug: binary-search
problem_title: Binary Search
problem_source_url: https://leetcode.com/problems/binary-search
implementation_id: python-iterative
language: python
language_label: Python
approach: iterative
approach_label: Iterative
title: Binary Search · Python Iterative
description: Binary Search solution in Python using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/python/src/array/iterative/BinarySearch.py
code_language: python
detail_url: "/eureka/problems/binary-search/#python-iterative"
embed_url: "/eureka/problems/binary-search/embed/python-iterative/"
project_slug: eureka
---

~~~python
from bisect import bisect_left
from typing import List


class BinarySearch:
    def search(self, nums: List[int], target: int) -> int:
        idx = bisect_left(nums, target)
        return idx if idx < len(nums) and nums[idx] == target else -1
~~~
