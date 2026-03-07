List=[2,3,5,4,7,6,9,23,45,21]
odd_num=list(filter(lambda x:x%2!=0,List))
print(odd_num)
even_num=list(filter(lambda x:x%2==0,List))
print(even_num)




list2=[1,2,-2,-5,3,4,5-4,-5,6,8,10,12]
postive_num=list(filter(lambda n:n>1,list2))
print(postive_num)

list1 = [2, 3, 4, 8, 9]
list2 = list(map(lambda x: x*x*x, list1))
print("Cube values are:", list2)

x=lambda m:m+15
print(x(24))
num=lambda x,y:x+y
print(num(2,3))


def fun_compute(n):
    return lambda x: n*x
result=fun_compute(2)
print("double of 15:",result(15))
result=fun_compute(3)
print("triple of 15  is:",result(15))
result=fun_compute(9)
print("multiply by 9 is:",result(15))
#result=fun_compute(9)
print("multiply by 100 is:",fun_compute(15)(100))

subject_marks = [('English', 88), ('Science', 90), ('Maths', 97), ('Social sciences', 82)]
print("ORIGINAL TUPLES=~~>",subject_marks)
subject_marks.sort(key=lambda x :x[1])
print("\nSorting the List of Tuples:")
print(subject_marks)

models = [
    {'make': 'Nokia', 'model': 216, 'color': 'Black'},
    {'make': 'Mi Max', 'model': '2', 'color': 'Gold'},
    {'make': 'Samsung', 'model': 7, 'color': 'Blue'}]
print("Original list of dictionaries:")
print(models)

sorted_models=sorted(models,key=lambda x:x["color"])
print(sorted_models)

nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
print("the Original list://",nums)
print("even_num")
even_num=list(filter(lambda x: x%2==0,nums)) 
print(even_num)
print("odd_num")
even_num=list(filter(lambda x: x%2!=0,nums)) 
print(even_num)

print("CHeck odd or Even ") 
print((lambda x: (x % 2 and 'Odd number' or 'Even number'))(5))
print((lambda x: (x % 2 and 'Odd number' or 'Even number'))(8))

listed_numbers=[2,4,5,6,7,8,9,10]
Square_list_num=list(map(lambda x:x**2,listed_numbers))
print(Square_list_num)



from functools import reduce
list1 = [20, 13, 4, 8, 9]
add = reduce(lambda x, y: x+y, list1)
print("Addition of all list elements is : ", add)#>/code>













    
    

  




    