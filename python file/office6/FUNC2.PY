#VARIABLE NAME ARGUMENTS
def var_name(x,*args):
    print("the result")
    print(x)
    for num in args:
        print(num)
    return
var_name(10)
var_name(26)
var_name(2,3,4,5)
#arguments variable in summation
def summation(*arg):
    sum=0 
    for num in arg:
       sum= sum+num 
    return sum
result=summation(2,3,4,5,66,7,)
print("sum of num=",result)
result=summation(1,2,3)
print("sum of num2=",result)
result=summation(1,2,3,4,5)
print("sum of num3=",result)
#average in arguments variable
def average(first,*rest):
    second=max(rest)
    return (first+second)/2
result=average(40,30,50,25)
print("the result of avg=",result)
# default arguments
def message(name="guest"):
    print("i am ",name)
message('tolesa')
message()
# Multiple Arguments With Arbitrary Keyword Arguments
def percent(math,sci,**optional):
    print("maths:",math)
    print("sci:",sci)
    sum=math+sci 
    for k,v in optional.items():
        print("{}:{}".format(k,v))
        sum=sum+v 
        return sum/(len(optional)+2)
result=percent(math=98,sci=78,fun=70,eng=98,his=90,geo=78)
print("percentage",result)

name="gemachu"
n=23 
print(f" {name}")
print(f"my name is {n}")
#square the numbers
def fun1_sqr():
    li_num=list()
    for num in range(1,20):
      li_num.append(num**2)
    return li_num 
result=fun1_sqr()
print(result)


#count numbers of vowels
string= "yerosan"
def coun_vowel(string):
    vowel=["a","e","i","o","u"]
    count=0
    for x in range(len(string)):
       if string [x] in vowel:
            count=count+1
    print("the numbers of vowel in str=:",count)
coun_vowel(string)

#change the letter upper to lower ....
string= "YERrosan"
def changed(string):
    new_change=""
    for i in string:
        if i.isupper():
            i=i.lower()
            new_change+=i
        elif i.islower():
            i=i.upper()
            new_change+=i
    print(new_change)
changed(string)

#count numbers of even and odd

given_list=[1,2,3,4,5,6,7,8,99,12,11,87]
def count_even_oddd(given_list):
    count_even=0 
    count_oddd=0 
    for num in given_list:
        if num%2==0:
            count_even+=1
        elif num%2!=0:
            count_oddd+=1 
        else:
            print("there no out of two option")
    print("odd numbers=",count_even)
    print("even numbers=",count_oddd)
count_even_oddd(given_list)
def sum_num():
    sum=0
    for x in range(1,10):
        sum+=x
    print(sum)
sum_num()

# Input: An integer number
num = 6

# Initialize the factorial variable to 1
def factorial(num):
    factorial = 1

# Calculate the factorial using a for loop
    for i in range(1, num + 1):
        factorial *= i

# Output: The factorial of the number
    print(f"The factorial of {num} is {factorial}")
factorial(num)



