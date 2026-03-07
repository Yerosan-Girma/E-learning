#n1=input("the first num")
# n2=input("the second num")
#n3=input("the third num")
n1=23
n2=3
n3=45
def maximum():
    if n1> n2 and n1>n3:
        print("n1 is greatest")
    elif n2> n3 and n2>n1:
        print('n2 is greatest')
    else:
        print("n3 is greatest")
maximum()
#sum of numbers in list
list=[1,23,34,5,56]
def sum_list(list):
    sum=0
    for num in list:
        sum+=num
    return sum 
print("the sum=",sum_list(list))


#multiply the list numbers
list1=[2,3,4,56,7,8]
def multiply(list1):
    mult=1
    for x in list1:
        mult*=x
    print("the product=",mult)
multiply(list1)



#reverse the string
string="123adds"
def reverse_string(string):
    new_reverse =""
    for i in range(len(string)-1,-1,-1):
        new_reverse+=string[i]
    print("The reverse=",new_reverse)             
reverse_string(string)

#calculate factorial numbers 
num=5
def factorial(num):
    if num==0:
        return 1
    else:
        return num*factorial(num-1)
print(factorial(num)) 
#test range
def test_range (n):
    if n in range(3,9):
        print("yes exist")
    else:
        print("the numbers is outside ")
test_range(67)
#count upper and lower
string="YerOsan GirmA "
def upper_lower(string):
    upper_case=0
    lower_case=0
    for i in string:
        if i.isupper():
            upper_case+=1
        elif i.islower():
            lower_case+=1
    print("uppercase",upper_case)
    print("lowercase",lower_case)
upper_lower(string)

#unique list the from listed list

num_list=[1,1,2,2,3,4,5,5,6,7,8]
def uniue_num(num_list):
    unique=[]
    for num in num_list:
        if num not in unique:
            unique.append(num)
    print(unique)
uniue_num(num_list)

#prime numbers
n=3
def test_prime(n):
    if (n==1):
       # return False
       print("not prime")
    elif (n==2):
       # return  True
       print("prime")
    else:
        for x in range(2,n):
            if (n%x==0):
                #return False
                print("not prime")
    #return  True
    print("prime")
#print(test_prime(n)) 

 
'''
print("Sum of all prime numbers in the said list of numbers:")
print(test(nums))
def test(nums):
    if len(nums)>0:
        return sum(list(filter(lambda x:(x>1 and all(x%y!=0 for y in range(2,x))),nums)))
    return "empty list"
nums = [1, 3, 4, 7, 9]
print("Original list:")
print(nums)
print("Sum of all prime numbers :",test(nums))
'''
l=[1,2,3,4,5]
def even_num(l):
    even=[]
    for x in l:
        if x%2==0:
            even.append(x)
    print(even)
even_num(l)
#separte sequence of words into lettter

words="week-month-year-decade"#input("eneter hyphen separate words")
def hyphen_separate(words):
    new_words=''
    new_words=words.split(',')
    for  x in words:
          new_words.append(x)
    print(new_words)
hyphen_separate(words)
#separte sequence of words into words

string="week-month-year-decade"#input("enter words separate hyphen")
def words_listed(string):
    for new_word in string:
        new_word=string.split(',')
        sorted_words=sorted(new_word)  
        sorted_string=','.join(sorted_words)
    print(sorted_string)
words_listed(string)
'''
#square the numbers

def square_num():
    l=list()
    for i in range(1,25):
        l.append(i**2)
    print(l)
square_num()
'''















