fb=open("wordlist.txt","r")
read_file=fb.read()
print(read_file)
fb.close()
fb=open("wordlist.txt","r")
read_file=fb.read()
print(read_file)
fb.close()
try:
    fb=open("names_list.txt")
    print(read_file)
except:
    print("the file you search does not exist")
finally:
    fb.close()

    #append the file
    fb=open("wordlist.txt","a")
    fb.write("gemachu")
    fb.close()
    fb=open("wordlist.txt","r")
    print(fb.read())
    fb.close()
#writea file


fb=open("myfile.txt","w")


fb.write("sodelete passage")
fb.close()
fb=open("myself.txt","r")
read_file=fb.read()
print(read_file)
fb.close()
#create the specified file ,but rturns an errrif file exis















































