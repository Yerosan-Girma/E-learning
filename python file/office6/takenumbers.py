#num=input("enter the sequence of numbers")
list=[2,3,4,5,6,7]
def test_differ(list):
    if len(list)==len(set(list)):
        return True
    else:
        return False
print(test_differ(list))
#print(test_differ(num))
 

#remove the list until it become to zero
int_list=[10, 20, 30, 40, 50, 60, 70, 80, 90]
'''
def remove (int_list):
# Set the starting position for removal to the 3rd element (0-based index).

   position = 3 - 1  
   idx=0
len_list=len(int_list)
while len_list>0:
     idx=(position + idx) % len_list
     removed_num=int_list.pop(idx)
     print(removed_num)
     len_list-=1

remove(int_list)
'''
num=6748#num=int(input("input four digit numbers"))
def sum_digit(num):
    x=num//1000
    x1=(num-x*1000)//100
    x2=(num-x*1000-x*100)//10
    x3=num-x*1000-x1*100-x2*10
    sum=x+x1+x2+x3
    print("THE SUM OF DIGIT=",sum)
sum_digit(num)

#sum of  digit numbers
num =56789# input("Enter Number: ")
num=str(num)
def sum_digit(num):
    sum = 0
    for i in num:
     sum = sum + int(i)
    print("sum of=",sum)
sum_digit(num)



#reverse the digit
def recursum(number,reverse):
  if number==0:
    return reverse
  remainder = int(number%10)
  reverse = (reverse*10)+remainder
  return recursum(int(number/10),reverse)

num = 1234
reverse = 0
print(recursum(num,reverse))



 
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
#print(check_prime(20,50))
#check prime or not 
num = 15
flag = 0
if num<2:
  flag = 1
else:
  for i in range(2,int((num/2)+1)):
    if num%i==0:
      flag = 1
      break

if flag == 1:
  print('Not Prime')
else:
  print("Prime")
#check prime or not numbers
num = 15
flag = 0
if num<2:
  flag = 1
else:
  for i in range(2,int((num/2)+1)):
    if num%i==0:
      flag = 1
      break
if flag == 1:
  print('Not Prime')
else:
  print("Prime")








