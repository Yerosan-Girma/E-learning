print("CLASS FUNCTION")
class student():
    def intro_self(self):
        print("my name is ",self.name)
        print("i am ", self.age,"years old")
        print(" sex ", self.sex)
stud1=student()
stud1.name="yerosan girma"
stud1.age=25
stud1.sex="male"
stud2=student()
stud2.name="faya wellaga"
stud2.age=23
stud2.sex="female"
stud1.intro_self()
stud2.intro_self()


print(" CLASS USING CONTRACT")

class student():
    def __init__(self,name,sex,age):
        self.name=name
        self.sex=sex
        self.age=age
    def intro_self(self):
        print("my name is ",self.name)
        print("i am ", self.age,"years old")
        print(" sex ", self.sex)
stud1=student("yerosan girma","male",24)
stud1=student("Faya wallega","female",22)
    
stud1.intro_self()
stud2.intro_self()





class person:
    def show(self):
        print("name",":>",self.name,"sex",":>",self.sex,"age:",":>",self.age,"job:",":>",self.job)
        print("name", self.name,"sex",self.sex,"age:",self.age,"job:",self.job)
        #first person 
firstdata=person()
firstdata.name="Gemachu Regesa"
firstdata.sex="male"
firstdata.age=24
firstdata.job="software enginering"
#second person
seconddata=person()
seconddata.name="Tolosa waqjira"
seconddata.sex="male"
seconddata.age=24
seconddata.job="medicine"

firstdata.show()
seconddata.show()
#using contract
class person:
    def __init__(self,name,sex,age,job):
        self.name=name
        self.sex=sex
        self.age=age
        self.job=job
    def show(self):
        print("name",":>",self.name,"sex",":>",self.sex,"age:",":>",self.age,"job:",":>",self.job)
        print("name", self.name,"sex",self.sex,"age:",self.age,"job:",self.job)
        
        
firstdata=person("chaltu","female",24,"secretary")
seconddata=person("abdisa","male",42,"banker")
firstdata.show()
seconddata.show()



    
   
        




