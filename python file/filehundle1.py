
#reading a file
'''
fy=open("fleyero.txt",'r')
red=fy.read()
print(red)
fy.close()
'''
#write a file
fy=open("fleyero.txt","w")
add_data="i write \\ a lot of time in writing python but debugging is very exhuasted"
fy.write(add_data)
#reading what i write now
fy=open("fleyero.txt","r")
read_new_data=fy.read()
print("PICK THE NEW DATA=",read_new_data)
fy.close()
#appending new information in existing file
fy=open("fleyero.txt","a")
new_file='''  Codes, if carefully written and properly promoted,
can be powerful instruments in the drive for profes sionalism and in establishing safeguards for society.
They do not have to be and should not be sterile '''
new_file=fy.write(new_file)
fy.close()
fy=open("fleyero.txt","r")
read=fy.read()
print("READ ALL =",read)
fy=open("fleyero.txt","r")
read=fy.read(100)
print("READ 100 CHAR=",read)
fy=open("fleyero.txt","r")
read=fy.readline()
print("THE FIRST LINE= ",read)



