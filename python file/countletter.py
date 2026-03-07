words="python exercise!"
def count_letter(words):
    count=0
    for x in words:
      if x.isalpha:       
        count=count+1 
    print(f"{words}: {count}")
count_letter(words)
'''
from collections import Counter

elements = [1, 2, 3, 4, 5, 11, 3, 3, 6, 7, 8, 9, 3, 10, 1]
element_counter = Counter(elements)

print("Most Common Elements:")
for element, count in element_counter.most_common():
    print(f"{element}: {count}")
'''
from collections import Counter
element=[1,2,3,3,4,5,5,5,6,6,7,7,7]
def common_element(element):
  element_counter=Counter(element)
  print("most common list")
  for element,count in element_counter.most_common():
    print(f"counted_common={element_counter}")
common_element(element) 


string="python"
def count_vowel(string):
  count_vowel=0
  vowels=['a','e','i','o','u']
  for x in range (len(string)):
      if string [x] in vowels:
        count_vowel+=1
  print(count_vowel)
count_vowel(string)
#counting words in sentence
string="learning python step by step for advanced"

def word_count(string):
  count=0
  for word in string.split():
    count+=1
  print("word count=",count)
word_count(string)
def  count_word():
  sentence="Red Green Black Black Red red Orange Pink Pink Red White."
   # Split the sentence into words
  word=sentence.split()
  # Create a Counter of the words
  word_counter=Counter(word)
  print("Words in Ascending Order:")
  sorted_word_asc=sorted(word_counter.items(),key=lambda items:items[1])
  for word , count in sorted_word_asc:
    print(f"counted words={word_counter}") 
    #print(f"{word}: {count}")
count_word()







