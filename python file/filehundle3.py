#writing a file 
object=open("myfile.txt","w")
write_new="ok create thics file to writing my file as much as remember it"
object.write(write_new)
object.close()
#reading what text exist in my file 
object=open("myfile.txt","r")
read_object=object.read()
print(read_object)
object.close()
#append additional information
object=open("myfile.txt","a")
new_info="\n i continue the next day for more deeply about file hundling  (yerosan)"
object.write(new_info)
#read new info append
object=open("myfile.txt","r")
read_info_append=object.read()
print("read_info_append:",read_info_append)
object=open("myfile.txt","r")
read=object.read(20)
print("THE 20 CHAR=",read)