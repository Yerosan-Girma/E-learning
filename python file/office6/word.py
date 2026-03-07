string="this is counting words in string using dictionary"
def count_word(string):
    count={}
    word_split=string.split()
    for word in word_split:
        if word in count:
            count[word]+=1
        else:
            count[word]=1
    print(count)
count_word(string)
# sum of digit in numbers
n=234
n=str(n)
def sum(n):
  sum=0
  for x in n:
    sum=sum+int(x)
  print("SUM DIGIT IS=",sum)
sum(n)

n1=23
n2=34
n3=54
def maximum():
    if n1>n2 and n1>n3:
        print("n1 is greater")
    elif n2>n3:
        print("n2 is greater ")
    else:
        print("n3 is greater")
maximum()
list=[1,2,3,4,5,6,6,7]
def multiply(list):
    mult=1
    for n in list:
        mult*=n
    print(mult)
multiply(list)
string="yerosan girma"
def reverse_string(string):
    new_reverse=""
    for i in range(len(string)-1,-1,-1):
        new_reverse+=string[i]
    print(new_reverse)
reverse_string(string)
n=5
def factorial(n):
    if n==0:
        return 1
    else:
        return n*factorial(n-1)
f=factorial(n)
print(f)

n=37
def prime_num(n):
    if (n==1):
        return False
    elif(n==2):
        return True
    else:
        for x in range(2,n):
            if n%x==0:
                return False
    return True
print(prime_num(n))

list=[1,2,3,4,5,6,7,8,10]
def even_num(list):
    even=[]
    for n in list:
        if n%2==0:
         even.append(n)
    print(even)
even_num(list)


words="week-month-year-decade"
def word_split(words):
    new_split=""
    new_split=words.split(',')
    for ch in words:
        new_split.append(ch)
    print(new_split)
word_split(words)


