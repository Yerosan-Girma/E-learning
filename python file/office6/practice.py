string1= "john is a boy and john loves to play cricket"
def count_word(string1,value):
    count=0
    words=string1.split()
    for ch in words:
        if ch==count_value:
            count+=1
    print("john occurs",+ count ," ","times")
count_value='john'

count_word(string1,count_value)

'''
def removed_num(num,reverse):
     
    if num==0:
        return reverse
        rem=int(num%10)
        rev=(reverse*10)+rem
        return removed_num(int(num/10),reverse)
    num=12345
    reverse=0
result=removed_num(num,reverse)
print(result)
'''

start=20
end=100
def prime_num(start,end):
    for num in range(start,end+1):
        if num>1:
            for i in range(2,101):
                if num%i==0:
                    break
            else:
                print(num)
prime_num(20,100)
