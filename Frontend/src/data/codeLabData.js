/* ========================================
   CODE LAB — DATA
   Problems, language templates, mock judge data
   ======================================== */

export const languages = [
  { id: 'python', label: 'Python 3', monacoId: 'python', ext: '.py' },
  { id: 'cpp', label: 'C++17', monacoId: 'cpp', ext: '.cpp' },
  { id: 'c', label: 'C', monacoId: 'c', ext: '.c' },
];

export const templates = {
  'two-sum': {
    python: `# Two Sum
# Given an array of integers nums and an integer target,
# return indices of the two numbers that add up to target.

def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

if __name__ == "__main__":
    nums = [2, 7, 11, 15]
    target = 9
    print(two_sum(nums, target))
`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < (int)nums.size(); i++) {
        int complement = target - nums[i];
        if (seen.count(complement)) return {seen[complement], i};
        seen[nums[i]] = i;
    }
    return {};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    auto result = twoSum(nums, target);
    cout << "[" << result[0] << ", " << result[1] << "]" << endl;
    return 0;
}
`,
    c: `#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                int* result = malloc(2 * sizeof(int));
                result[0] = i;
                result[1] = j;
                *returnSize = 2;
                return result;
            }
        }
    }
    *returnSize = 0;
    return NULL;
}

int main() {
    int nums[] = {2, 7, 11, 15};
    int target = 9;
    int returnSize;
    int* result = twoSum(nums, 4, target, &returnSize);
    printf("[%d, %d]\\n", result[0], result[1]);
    return 0;
}
`,
  },
};

const genericTemplates = {
  python: (title) => `# ${title}\n\ndef solve():\n    pass\n\nif __name__ == "__main__":\n    solve()\n`,
  cpp: (title) => `#include <bits/stdc++.h>\nusing namespace std;\n\n// ${title}\n\nint main() {\n    \n    return 0;\n}\n`,
  c: (title) => `#include <stdio.h>\n\n// ${title}\n\nint main() {\n    \n    return 0;\n}\n`,
};

export function getTemplate(problemId, language) {
  if (templates[problemId]?.[language]) return templates[problemId][language];
  const problem = codeProblems.find(p => p.id === problemId);
  return genericTemplates[language](problem?.title || 'Solution');
}

export const codeProblems = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    acceptance: 49.2,
    category: 'Arrays',
    tags: ['Array', 'Hash Table'],
    statement: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.`,
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    inputFormat: 'An array of integers nums, and an integer target.',
    outputFormat: 'An array of two indices [i, j] such that nums[i] + nums[j] == target.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'nums[1] + nums[2] == 6.' },
    ],
    hints: [
      'A brute-force approach checks every pair — can you do better than O(n²)?',
      'Try storing numbers you\'ve already seen in a hash map, along with their index.',
      'For each number, check if its complement (target - num) already exists in the map.',
    ],
    editorial: {
      approach: 'Use a hash map to store each number and its index as you iterate. For each element, check whether its complement (target - current number) has already been seen.',
      complexity: 'Time: O(n) — a single pass through the array. Space: O(n) for the hash map.',
    },
    defaultTestCases: [
      { id: 1, input: '[2,7,11,15]\n9', expected: '[0,1]' },
      { id: 2, input: '[3,2,4]\n6', expected: '[1,2]' },
      { id: 3, input: '[3,3]\n6', expected: '[0,1]' },
    ],
  },
  {
    id: 'reverse-string',
    title: 'Reverse String',
    difficulty: 'Easy',
    acceptance: 76.4,
    category: 'Strings',
    tags: ['String', 'Two Pointers'],
    statement: 'Write a function that reverses a string. The input string is given as an array of characters `s`, and you must modify it in place with O(1) extra memory.',
    constraints: ['1 <= s.length <= 10^5', 's[i] is a printable ASCII character.'],
    inputFormat: 'A character array s.',
    outputFormat: 'The array s reversed in place.',
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]', explanation: 'Reverse in place.' },
    ],
    hints: [
      'Use two pointers, one at the start and one at the end.',
      'Swap the characters at each pointer and move them toward the center.',
    ],
    editorial: { approach: 'Two-pointer swap from both ends toward the middle.', complexity: 'Time: O(n). Space: O(1).' },
    defaultTestCases: [
      { id: 1, input: '["h","e","l","l","o"]', expected: '["o","l","l","e","h"]' },
      { id: 2, input: '["H","a","n","n","a","h"]', expected: '["h","a","n","n","a","H"]' },
    ],
  },
  {
    id: 'palindrome-number',
    title: 'Palindrome Number',
    difficulty: 'Easy',
    acceptance: 54.1,
    category: 'Arrays',
    tags: ['Math'],
    statement: 'Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.',
    constraints: ['-2^31 <= x <= 2^31 - 1'],
    inputFormat: 'An integer x.',
    outputFormat: 'true or false.',
    examples: [
      { input: 'x = 121', output: 'true', explanation: '121 reads the same backward.' },
      { input: 'x = -121', output: 'false', explanation: 'Reads as 121- backward, not a palindrome.' },
    ],
    hints: ['Negative numbers are never palindromes.', 'Try reversing half the number and comparing.'],
    editorial: { approach: 'Reverse the second half of the number and compare it to the first half, avoiding overflow and string conversion.', complexity: 'Time: O(log n). Space: O(1).' },
    defaultTestCases: [
      { id: 1, input: '121', expected: 'true' },
      { id: 2, input: '-121', expected: 'false' },
      { id: 3, input: '10', expected: 'false' },
    ],
  },
  {
    id: 'maximum-subarray',
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    acceptance: 50.6,
    category: 'Dynamic Programming',
    tags: ['Array', 'DP', 'Divide and Conquer'],
    statement: 'Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum, and return its sum.',
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    inputFormat: 'An array of integers nums.',
    outputFormat: 'A single integer — the maximum subarray sum.',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has sum 6.' },
    ],
    hints: ['Consider Kadane\'s algorithm.', 'At each index, decide whether to extend the previous subarray or start fresh.'],
    editorial: { approach: 'Kadane\'s algorithm: track the best sum ending at the current index, resetting when it goes negative.', complexity: 'Time: O(n). Space: O(1).' },
    defaultTestCases: [
      { id: 1, input: '[-2,1,-3,4,-1,2,1,-5,4]', expected: '6' },
      { id: 2, input: '[1]', expected: '1' },
      { id: 3, input: '[5,4,-1,7,8]', expected: '23' },
    ],
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    difficulty: 'Easy',
    acceptance: 55.8,
    category: 'Searching',
    tags: ['Array', 'Binary Search'],
    statement: 'Given a sorted array of integers `nums` and a target value, return the index of target if found, otherwise return -1.',
    constraints: ['1 <= nums.length <= 10^4', 'nums is sorted in ascending order.'],
    inputFormat: 'A sorted array nums, and an integer target.',
    outputFormat: 'The index of target, or -1.',
    examples: [{ input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists at index 4.' }],
    hints: ['Compare the target with the middle element.', 'Narrow the search range by half each time.'],
    editorial: { approach: 'Classic binary search with low/high pointers, halving the search space each iteration.', complexity: 'Time: O(log n). Space: O(1).' },
    defaultTestCases: [
      { id: 1, input: '[-1,0,3,5,9,12]\n9', expected: '4' },
      { id: 2, input: '[-1,0,3,5,9,12]\n2', expected: '-1' },
    ],
  },
  {
    id: 'merge-intervals',
    title: 'Merge Intervals',
    difficulty: 'Medium',
    acceptance: 46.3,
    category: 'Arrays',
    tags: ['Array', 'Sorting'],
    statement: 'Given an array of intervals, merge all overlapping intervals and return an array of the non-overlapping intervals that cover all the intervals in the input.',
    constraints: ['1 <= intervals.length <= 10^4', 'intervals[i].length == 2'],
    inputFormat: 'An array of [start, end] intervals.',
    outputFormat: 'An array of merged, non-overlapping intervals.',
    examples: [{ input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explanation: '[1,3] and [2,6] overlap, merge into [1,6].' }],
    hints: ['Sort the intervals by start time first.', 'Walk through and merge whenever the current interval overlaps the last merged one.'],
    editorial: { approach: 'Sort by start, then greedily merge adjacent overlapping intervals in a single pass.', complexity: 'Time: O(n log n). Space: O(n).' },
    defaultTestCases: [
      { id: 1, input: '[[1,3],[2,6],[8,10],[15,18]]', expected: '[[1,6],[8,10],[15,18]]' },
      { id: 2, input: '[[1,4],[4,5]]', expected: '[[1,5]]' },
    ],
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    acceptance: 40.9,
    category: 'Strings',
    tags: ['String', 'Stack'],
    statement: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[`, `]`, determine if the input string is valid (properly opened and closed, in the correct order).',
    constraints: ['1 <= s.length <= 10^4'],
    inputFormat: 'A string s.',
    outputFormat: 'true or false.',
    examples: [{ input: 's = "()[]{}"', output: 'true', explanation: 'All brackets are matched.' }],
    hints: ['A stack is perfect for tracking the most recent open bracket.', 'Push opening brackets, and pop-and-compare on closing brackets.'],
    editorial: { approach: 'Use a stack: push opening brackets, and on a closing bracket, pop and verify it matches.', complexity: 'Time: O(n). Space: O(n).' },
    defaultTestCases: [
      { id: 1, input: '"()[]{}"', expected: 'true' },
      { id: 2, input: '"(]"', expected: 'false' },
    ],
  },
  {
    id: 'longest-common-prefix',
    title: 'Longest Common Prefix',
    difficulty: 'Easy',
    acceptance: 44.2,
    category: 'Strings',
    tags: ['String'],
    statement: 'Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string `""`.',
    constraints: ['1 <= strs.length <= 200'],
    inputFormat: 'An array of strings strs.',
    outputFormat: 'The longest common prefix string.',
    examples: [{ input: 'strs = ["flower","flow","flight"]', output: '"fl"', explanation: 'All three strings start with "fl".' }],
    hints: ['Compare characters column by column across all strings.', 'Stop as soon as a mismatch or a string ends.'],
    editorial: { approach: 'Vertical scanning: compare the i-th character of every string until a mismatch is found.', complexity: 'Time: O(S) where S is total characters. Space: O(1).' },
    defaultTestCases: [
      { id: 1, input: '["flower","flow","flight"]', expected: '"fl"' },
      { id: 2, input: '["dog","racecar","car"]', expected: '""' },
    ],
  },
  {
    id: 'container-with-most-water',
    title: 'Container With Most Water',
    difficulty: 'Medium',
    acceptance: 55.1,
    category: 'Arrays',
    tags: ['Array', 'Two Pointers', 'Greedy'],
    statement: 'Given `n` non-negative integers representing an elevation map, find two lines that together with the x-axis form a container that holds the most water.',
    constraints: ['2 <= n <= 10^5', '0 <= height[i] <= 10^4'],
    inputFormat: 'An array of integers height.',
    outputFormat: 'The maximum amount of water the container can store.',
    examples: [{ input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49', explanation: 'Lines at index 1 and 8 form the largest container.' }],
    hints: ['Start with two pointers at both ends.', 'Move the pointer at the shorter line inward — moving the taller one can never improve the area.'],
    editorial: { approach: 'Two pointers from both ends, always moving the shorter side inward since it\'s the limiting factor.', complexity: 'Time: O(n). Space: O(1).' },
    defaultTestCases: [
      { id: 1, input: '[1,8,6,2,5,4,8,3,7]', expected: '49' },
      { id: 2, input: '[1,1]', expected: '1' },
    ],
  },
  {
    id: 'climbing-stairs',
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    acceptance: 51.7,
    category: 'Dynamic Programming',
    tags: ['DP', 'Math'],
    statement: 'You are climbing a staircase with `n` steps. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    constraints: ['1 <= n <= 45'],
    inputFormat: 'An integer n.',
    outputFormat: 'The number of distinct ways to reach the top.',
    examples: [{ input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, 2+1 — three ways.' }],
    hints: ['This is really the Fibonacci sequence in disguise.', 'ways(n) = ways(n-1) + ways(n-2).'],
    editorial: { approach: 'Bottom-up DP equivalent to Fibonacci: each step count is the sum of the previous two.', complexity: 'Time: O(n). Space: O(1) with rolling variables.' },
    defaultTestCases: [
      { id: 1, input: '2', expected: '2' },
      { id: 2, input: '3', expected: '3' },
      { id: 3, input: '5', expected: '8' },
    ],
  },
];

export const categoryList = ['Arrays', 'Strings', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Searching', 'Greedy'];
export const difficultyList = ['Easy', 'Medium', 'Hard'];

/* ---- Code Lab progress snapshot (header + profile stats) ---- */
export const codeLabProgress = {
  solved: { easy: 4, medium: 1, hard: 0 },
  totalProblems: { easy: 6, medium: 3, hard: 1 },
  todaysGoal: { done: 1, target: 2 },
  weeklyGoal: { done: 5, target: 10 },
  streak: 6,
  favoriteLanguage: 'C++',
  accuracy: 78,
  totalRuntime: '4.2s avg',
  studyTime: '3h 40m this week',
};

/* ---- AI Assistant canned/progressive responses ---- */
export const aiActions = [
  { id: 'explain-problem', label: 'Explain Problem' },
  { id: 'explain-constraints', label: 'Explain Constraints' },
  { id: 'give-hint', label: 'Give Hint' },
  { id: 'find-bug', label: 'Find Bug' },
  { id: 'explain-error', label: 'Explain Error' },
  { id: 'dry-run', label: 'Dry Run' },
  { id: 'optimize', label: 'Optimize Solution' },
  { id: 'time-complexity', label: 'Time Complexity' },
  { id: 'space-complexity', label: 'Space Complexity' },
  { id: 'edge-cases', label: 'Generate Edge Cases' },
  { id: 'explain-algorithm', label: 'Explain Algorithm' },
];

export function getAiResponse(actionId, problem, hintIndex) {
  switch (actionId) {
    case 'explain-problem':
      return `Here's the gist: ${problem.statement.split('\n')[0]} Think about what data you need to track as you scan through the input once.`;
    case 'explain-constraints':
      return `Key constraints to watch: ${problem.constraints.slice(0, 2).join(' — ')}. These usually hint at the expected time complexity.`;
    case 'give-hint': {
      const hint = problem.hints[Math.min(hintIndex, problem.hints.length - 1)];
      return `Hint ${Math.min(hintIndex + 1, problem.hints.length)}/${problem.hints.length}: ${hint}`;
    }
    case 'find-bug':
      return "I scanned your code — check your loop boundary conditions and make sure you're not reusing the same index twice. Want me to point at the exact line?";
    case 'explain-error':
      return "That error usually means a type mismatch or an out-of-bounds access. Double check the variable types you're passing into your function.";
    case 'dry-run':
      return `Let's trace through with the first example: ${problem.examples[0].input} → expected ${problem.examples[0].output}. Walk your logic step by step against it.`;
    case 'optimize':
      return `Your current approach works — the ideal complexity here is ${problem.editorial.complexity.split('.')[0]}. See if you can avoid any nested loops or repeated scans.`;
    case 'time-complexity':
      return `Expected time complexity: ${problem.editorial.complexity.split('Space:')[0].replace('Time:', '').trim()}`;
    case 'space-complexity':
      return `Expected space complexity: Space: ${problem.editorial.complexity.split('Space:')[1] || 'O(1)'}`;
    case 'edge-cases':
      return 'Consider: empty input, a single element, all identical values, and the largest allowed input size for performance.';
    case 'explain-algorithm':
      return problem.editorial.approach;
    default:
      return "I'm here to help — try one of the quick actions above, or ask me anything about this problem.";
  }
}
