num=12348
def sum_digit(num):
    x=num//10000
    x1=(num-x*10000)//1000
    x2=(num-x*10000-x1*1000)//100
    x3=(num-x*10000-x1*1000-x2*100)//10
    x4=num-x*10000-x1*1000-x2*100-x3*10
     
    print(x+x1+x2+x3+x4)
sum_digit(num)
num=1234
def sum(num):
    x = num // 1000

# Extract the hundreds digit (x1) by subtracting the thousands digit from the number.
    x1 = (num - x * 1000) // 100

# Extract the tens digit (x2) by subtracting the thousands and hundreds digits from the number.
    x2 = (num - x * 1000 - x1 * 100) // 10

# Extract the ones digit (x3) by subtracting the thousands, hundreds, and tens digits from the number.
    x3 = num - x * 1000 - x1 * 100 - x2 * 10

# Calculate the sum of the digits in the number and print the result.
    print("The sum of digits in the number is", x + x1 + x2 + x3)
sum(num)
#SUM OF THREE NUMBERS
def sum_3(x,y,z):
    sum=0
    sum=x+y+z
    if x==y==z:
        return z*3
sum=sum_3(45,45,45)
print("sum_3=",sum)
# sum n+nn+nnn............+nnnn
a=5
num=str(num)
def sum_n(a):
    for n in num:
         n1=a
         n2=int(str(a)*2)
         n3=int(str(a)*3)
         sum=n1+n2+n3
    print("n+nn+nnn=",sum)
sum_n(a)
#LCM OF TWO NUMBERS
def lcm_num(x,y):
    if x>y:
        z=x
    else:
        z=y
    while True:
         if (z%x==0) and (z%y==0): 
            lcm=z
            break
         z+=1
    print("lcm=",lcm)
lcm_num(4,6)
#SUM FIRST NUMBERS
n=8
def sum_num(n):
    sum_first=0
    sum_first=(n*(n+1))/2
    print("Sum of the first positive integers:", sum_first)
sum_num(n)
#SUM FIRST NUMBERS using function
n=8
def sum_first(n):
    sum=0
    for x in range(1,n+1):
        sum+=x
    print("sum_first=",sum)
sum_first(n)

#SUM NUMBERS IN LIST
List=[1,2,3,4,5,6,7,8,9,10]
def sum_list_num(List):
    sum=0
    for num in List:
        sum+=num
    print("sum num in listed=",sum)
sum_list_num(List)






 













