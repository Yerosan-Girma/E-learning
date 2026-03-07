
string="what-add-hallenged"
def word_separte(string):
    list=[]
    for x in string:
        x.split('-')
    list.sort(x)
    print("word of separated=>",'-'.join(list))
word_separte(string)