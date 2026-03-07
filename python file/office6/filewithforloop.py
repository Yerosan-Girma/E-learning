l=["weeks\n","of\n","the\n","exam\n"]
#write the file using loop
file1=open("loop.txt","w")
file1.writelines(l)
file1.close()
 #open file
file1=open("loop.txt","r")
count=0
print("Using for loop")
for line in file1:  
    count += 1
    print("Line{}: {}".format(count, line.strip()))

# Closing files
file1.close()



with open("loop.txt") as fs:
    lines=[line for line in fs]
    print(lines)
#removing the new line characters
with open("loop.txt") as fs:
    lines=[line.rstrip() for line in fs]
    print(lines)
'''
with open(r"loop.txt", 'r') as fp:
    # lines to read
    line_numbers = [4, 7]
    # To store lines
    lines = []
    for i, line in enumerate(fp):
        # read line 4 and 7
        if i in line_numbers:
            lines.append(line.strip())
        elif i > 7:
            # don't read after line 7 to save time
            break
print(lines)
'''


with open("loop1.txt","r") as fp:
     lines_numbers=[2,4]
     lines=[]
     for i,line in enumerate(fp):
       if i in lines_numbers:
        lines.append(line.strip())
       elif i>7:
        break
print(lines)









    








