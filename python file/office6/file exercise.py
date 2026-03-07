
with open("data.txt","r") as c:
  print("check if the file is closed:", c.closed)  


# Close the file
c.close()
print("check if file closed:" ,c.closed)
#random file reading
import random
with open("data1.txt","r") as fd:
    line=fd.readline()
data_random=random.choice(line)
print(data_random.strip())
#Remove newline characters from a file.

with open("data1.txt","r") as fd:
    lines=fd.readline()
    cl_new=[lines.strip() for line in lines]
with open("data1.txt","w") as fd:
        for line in cl_new:
            fd.write(line + "\n ")
print("Newline characters removed successfully!")
#Write a Python program that takes a text file as input and returns the3 number of words

f="newfile.txt"
def count_word(file):
    with open( file) as f:
     data=f.read()
     data=data.replace("," ,"")
    new_data=len(data.split(" "))
    print(new_data)
count_word(f)


#f=open("newdata.txt","x")
f=open("newdata.txt","w")
data1_w='''i am yerosan girma 
software engineering student
in haramaya university
in 2017 academic
'''

f.write(data1_w)
f=open("newdata.txt","r")
data=f.readlines()
print(data)
for line in data:
    print(line)
f.close()


#new data on exist file
f=open("newdata.txt","w")
data2_w=["nursing\n","maths\n","software\n","medicine\n","civil\n"]
data2_w=str(data2_w)
f.write(data2_w)
for line in data:
    print(line)
f.close()

f=open("newdata.txt","r")
data=f.readlines()
print(data)
for line in data:
    print(line)
f.close()

'''
#Writing User Input to the File.
#file=open("student2.txt","x")
file=open("student.txt","a")
#take input from user
name=input("eneter your name:")
age=input("eneter your age: ")
sex=input("your sex: ")

file.write(name)
file.write("\n")
file.write(age)
file.write("\n")
file.write(sex)
file.write("\n")
file.close()
file=open("student.txt","r")
read_data=file.read()
print(read_data)
file.close()
'''
with open("fleyero.txt","r") as f1,open("data.txt","r") as f2:
    for line1 ,line2  in zip(f1,f2):
       print(line1+line2)



def read_file_line(file):
    with open(file,"r") as f:
        for line in f:
            print(line.strip())
read_file_line("fleyero.txt")
import types
def func():
    return 1
print(isinstance(func,types.FunctionType))
print(isinstance(func,types.LambdaType))
print(isinstance(lambda x:x,types.LambdaType))
print(isinstance(lambda x:x,types.FunctionType))
print(isinstance(abs,types.FunctionType))
print(isinstance(abs,types.LambdaType))
print(isinstance(max,types.FunctionType))
print(isinstance(max,types.LambdaType))
