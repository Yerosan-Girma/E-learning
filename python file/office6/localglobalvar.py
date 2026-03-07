def even (list1):
  even_num=[]
  for n in list1:
    if n % 2==0:
      
        even_num.append(n)
  return even_num
even_num=even([2,3,42,51,62,70,5,9])
print("even numbers are:",even_num)

def arithmetic(n1,n2):
    add=n1+n2
    sub=n1-n2
    multiply=n1*n2
    division=n1/n2
    return add,sub,multiply,division
    a,b,c,d=arithmetic(10,12)
    print(" add :",a)
    print(" sub :",b)
    print(" multiply:",c)
    print(" division :",d)
    
global_var=54
def function1():
    print("value in 1st function:", global_var)
def function2():
 #modify global function
 # function will treat it as a local #variable
 global_var=65
 print("value in 2nd function",global_var)
def function3():
    print("value in 3rd function",global_var)
function1()
function2()
function3()



x=6
def fuc1():
    print("value of first function:",x)
#define 2nd function
def fuc2():
#modify global variable using global #keyword
    global x 
    x=25
    print("value of second function:",x)
def fuc3():  
    print("value 3rd fuc:",x)
fuc1()
fuc2()
fuc3()
def myfunc(name,age):
    print(name,age)
 #call function
myfunc("yerosan=",39)



def calculate(a,b):
   add=a+b
   sub=a-b
   print(add)
   print(sub)
calculate(23,56)




def even_numbers(nums):
    even_list = []
    for n in nums:
        if n % 2 == 0:
            even_list.append(n)
    return even_list

num_list = [10, 5, 12, 78, 6, 1, 7, 9]
ans = even_numbers(num_list)
print("Even numbers are:", ans)