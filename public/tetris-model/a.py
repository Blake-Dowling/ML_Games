import json
import os

# os.system('ls')
with open('./public/tetris-model/trainingHistory', 'r') as f:
    j = json.load(f)
    s = j['scoreHistory']
    for i in range(len(s)):
        s[i] = float("{:.2f}".format(s[i] / 10))
    
    print(j)
    with open('./public/tetris-model/trainingHistory2', 'w') as o:
        json.dump(j, o)