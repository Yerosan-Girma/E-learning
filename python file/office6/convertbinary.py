# sum of digit in numbers
n=234 
n=str(n)
def sum(n):
  sum=0
  for x in n:
     sum=sum+int(x)
  print("SUM DIGIT IS=",sum)
sum(n)
#convert decimal to binary numbers
number=23
def dec_to_bin(number):
    if number>1:
        dec_to_bin(number//2)
    print(number%2,end='')
print(f"binary of {number}=",end='')
dec_to_bin(number)
print('')
#BINARY TO DECIMAL

binar_str="1101"
def binary_to_decimal(binar_str):
    decimal=0
    power=0#len(binar_str)-1
    for digit in binar_str:
        decimal=+int(digit)*(2**power)
        power+=1
    print("decimal numbers=",decimal)
binary_to_decimal(binar_str)



#CONVERT TIMING IN DIFFERENT UNIT
t=234
def time_sec(t):
    sec=0
    sec=t*3600
    print(sec)

time_sec(t)

d=3
hr=12
min=234
def day_hr_sec():
    day=d*3600*24
    hour=hr*3600
    minute=min*60
    sec=day+hour+minute
    print(sec)
day_hr_sec()



#worksheet question

 
#CHANGED THE UPPER AND LOWER
string="YErosan"
def changed(string):
    new_change=''
    for x in string:
        if x.isupper():
           x= x.lower()
           new_change+=x
        elif x.islower():
            x=x.upper()
            new_change+=x
    print(new_change)
changed(string)
#CONVERT TEMPERATURE EACH OTHERS 
tem_cel=23#float(input("enter degree celsius"))
def celsius_to_ferh(tem_cel):
    tem_f=9/5*(tem_cel)+32
    print("TEMPERATURE FERHANIET=",tem_f)
celsius_to_ferh(tem_cel)

num1=45#(input("enter the first numbers "))
num2=23#(input("enter the second numbers"))
def product_num():
    mult=1
    #sum=0
    mult=num1*num2
    print("product of two num take from user=",mult)
    if mult >500:
        sum=num1+num2
        print("the sum of two if >500",sum)
    else:
        print("leave the function")
    #print(mult)
    #print(sum)
product_num()
#SUM NUMBERS IN LIST
List=[1,2,3,4,5,6,7,8,9,10]
def sum_list_num(List):
    sum=0
    for num in List:
        sum+=num
    print("sum num in listed=",sum)
sum_list_num(List)
#upper case and lower case
string="yerSAN"
def num_upper_lower(string):
    upper_case=0
    lower_case=0
    for i in string:
        if i.isupper():
            upper_case+=1
        elif i.islower():
            lower_case+=1
    print("upper_case=",upper_case)
    print("lower_case=",upper_case)
num_upper_lower(string)
#MIDDLE STRING IN PYTHON
strings="YEOKEE"
def middle_string(strings):
    length_str=len(strings)
    if length_str%2==0:
      middle_letter= strings[length_str//2-1:length_str//2 +1]
      print("middle letter",middle_letter)
    else:
    #length_str%2!=0:
        middle_letter=strings[length_str//2]
        print("middle letter=",middle_letter)
        #UNIQUE LIST 
middle_string(strings)
#n=input("enter the numbers separate comma")
#n=list(n)
n=[1,2,2,2,3,3,4,56,78,90,345]
def unique_num(n):
    new_list=[]
    for x in n:
        if x not in new_list:
            new_list.append(x)
    print(new_list)
unique_num(n)
#remove string duplicates  using list
string= "pythonlobby"
def removed_dup(string):
    new_ch=[]
    for ch in string:
        if ch not in new_ch:
            new_ch.append(ch)
            new_str="".join(new_ch)
    print(new_str)       
removed_dup(string)
#remove string duplicates  using in store empty string "  "
string= "pythonlobby"
def removed_dup(string):
     new_ch=""
     for ch in string:
        if ch not in new_ch:
             new_ch+=ch
     print(new_ch)
removed_dup(string)

 #occurrence of character in string
string="programm"
def occur_char(string):
    count_str={}#initialize empty dictionary
    for ch in string:
            keys=count_str.keys()
            if ch in keys:#if ch already in a key increment value  by 1
              count_str[ch]+=1
            else:
               count_str[ch]=1
    print(count_str)
occur_char(string)
 

#count word in string each one by one 
str="this week is the exam week  that boring result face me "
def count_word(str):
    count={} #init empty dict
    words=str.split()
    for wr  in words:
        if wr in count:
            count[wr]+=1
            
        else:
           count[wr]=1
    print(count)
count_word(str)
#counting words in sentence
string="learning python step by step for advanced"

def word_count(string):
  count=0
  word_spl=string.split()
  for word in word_spl:
    count+=1
  print("word count=",count)
word_count(string)
#sorting lowering to upper character in string
strings="pytHOnloBBy"
def low_upper(strings):
    lower_case=[ch for ch in strings if ch.islower()]
    upper_case=[ch for ch in strings if ch.isupper()]
    low_upper=lower_case+upper_case
    print(''.join(low_upper))
low_upper(strings)
#.count lower, upper, numeric and special characters in a string.
str = "@pyThOnlobb!Y34"
def low_up_spec(str):
    lower_case=0
    upper_case=0
    digit=0
    special=0

    for i in str:
        if i.islower():
            lower_case+=1
        elif i.isupper():
            upper_case+=1
        elif i.isdigit():
            digit+=1
        else:
            special+=1
    print(lower_case)
    print(upper_case)
    print(special)
    print(digit)
low_up_spec(str)
#counting the vowel character in string
string="python"
def count_vowel(string):
  count_vowel=0
  vowels=['a','e','i','o','u']
  for x in range (len(string)):
      if string [x] in vowels:
        count_vowel+=1
  print(count_vowel)
count_vowel(string)
#20.count the occurrence of a specific value in a list.
list=[1,2,3,3,4,5,3,6]
def specific_value(list,value):
    count=0
    for x in list:
        if x==value:
            count+=1
    print("count_3=",count)
count_value=3#count_value=int(input("enter the value "))count_value=3
specific_value(list,count_value)

list=[1,2,3,3,4,5,3,6]
def specific_value(list):
    count=0
    for num in list:
        if num==3:
            count+=1
    print("cout_num_3=",count)
specific_value(list)
list=[1,2,3,4,5,6,7,8]
def square(list):
    num=[]
    for i in list:
        squ_num=i**2
        num.append(squ_num)
    print(num)
square(list)
#DUPLICATE numbers  IN LIST
num =[1,2,2,3,4,5,6,6]
def removed_dup(num):
    list_n=[]
    for n in num:
        if n not in list_n:
            list_n.append(n)
    print("new list num=",list_n)
removed_dup(num)
#EVEN ODD NUMBERS IN LIST
list1=[2, 23, 24, 51, 46, 67]
def even_odd(list1):
    even_num=[]
    odd_num=[]
    for x in list1:
        if x%2==0:
            even_num.append(x)
        elif x%2!=0:
            odd_num.append(x)
    print("even=",odd_num)
    print("odd=",even_num)
even_odd(list1)
#count the occurrence of a specific word in a string.
string1= "john is a boy and john loves to play cricket"
def count_word(string1,value):
    count=0
    words=string1.split()
    for ch in words:
        if ch==count_value:
            count+=1
    print("john occurs",+ count ," ","times")
count_value='john'#count_value=input("enter the value")
count_word(string1,count_value)
#swaping two numbers without any others variables
a=10
b=20
def swaping(a,b):
    a=10
    b=20
    print("before swap:",a,b)
    a=a+b#30
    b=a-b#10
    a=a-b#20
    print("after swap:",a,b)
swaping(a,b)
#swaping using third variable
def swap(a,b):
    a=10
    b=20
    print("before swap:",a,b)
    x=a
    temp=x#10
    #after swap
    a=b#20
    b=temp#10
    print("after swap:",a,b)
swap(a,b)

#reverse the string
string="123addis"
def reverse_string(string):
    new_reverse =""
    for i in range(len(string)-1,-1,-1):
        new_reverse+=string[i]
    print("The reverse=",new_reverse)             
reverse_string(string)

#prime numbers
start=20
end=50
def check_prime(start,end):
    for num in range(start,end+1):
        if num>1:
            for i in range(2,num):
                if num%i==0:
                    break 
            else:
                print(num)
check_prime(20,50)         








































