
def range_num():
    list_num=list()
    for i in range (1,20):
      list_num.append(i**2)
      list_num.append(i**3)
    print(list_num)
range_num()
#WORD SEPARATE HYPHAN
string="year-week-month-day"
# string=input("enter hayphen separate words")
def word_separte(string):
    list=[]
    for x in string:
        x.split('-')
        list.sort()
    print("word of separated=>",'-'.join(list))

word_separte(string)

l=[{'name':"tolesa",'age':25,'color':"male"},
   {'make': 'Samsung', 'model': 7, 'color': 'Blue'}]
for x in l:
    sorted_dic=sorted(l,key=lambda x:x['color'])
    print(sorted_dic)
subject_marks = [('English', 88), ('Science', 90), ('Maths', 97), ('Social sciences', 82)]
subject_marks.sort(key=lambda x:x[1])
print(subject_marks)
subject_marks = ['English', 'Science', 'Maths', 'Social sciences']
def order_list(word):
    letter='e'
    return word.find(letter)
sorted_list=sorted(subject_marks,key=order_list)
print(sorted_list)



list=[2,3,4,56,7,8,90,45,24,46]
def even_n (list):
    list_even=[]
    list_odd=[]
    for num in list:
        if num%2==0:
            list_even.append(num)
        elif num%2!=0:
            list_odd.append(num)
    print(list_even)
    print(list_odd)
even_n(list)
starts_with = lambda x: True if x.startswith('P') else False
print(starts_with("yerosan"))
print(starts_with("Prisoness"))
'''
list1= [2, 3, 4, 8, 9]
list2 = list(map(lambda x: x*x*x, list1))
print("Cube values are:", list2)
'''
from functools import reduce
list1 = [20, 13, 4, 8, 9]
add = reduce(lambda x, y: x+y, list1)
print("Addition of all list elements is : ", add)#>/code>
 

import datetime
now=datetime.datetime.now()
print(now)
year=lambda x:x.year
month=lambda x:x.month
day=lambda x:x.day
time=lambda x:x.time()
print(year(now))
print(month(now))
print(day(now))
print(time(now))
import time
t=lambda x:x.time()
print(t(now))
string=("python lambda")
str="2535"
check=( lambda x:True if x.isdigit else  False )
print(check(string))
print(check('26587'))
print(check ('4.2365'))
print(check("-12547"))
print(check('00'))
print(check('A001'))
print(check("0.001"))

print(check(str))
print("checked string")
str="354"
#It first removes the first decimal point in the string using 'replace()',
# then checks if the resulting string is composed of digits using 'isdigit()'

check= lambda q: q.replace('.', '', 1).isdigit()
print(check('00'))
print(check('A001'))
print(check("0.001"))
print(check("week"))
print(check(str))



