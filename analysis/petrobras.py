from pymongo import MongoClient
import pandas as pd
from matplotlib import pyplot
import json
from neo4j.v1 import GraphDatabase
import time

uri = "bolt://localhost:7687"
auth = ("neo4j", "1230")
driver = GraphDatabase.driver(uri, auth=auth)
session = driver.session()

# create index
#q = "MATCH (k:Keyword) WHERE lower(k.text) contains 'petrobras' RETURN k"
#q = "MATCH (n:News) WHERE n.headline = 'Bovespa fecha em leve alta; BRF cai quase 20% e perde quase R$ 5 bi em valor de mercado' RETURN n"
q = "MATCH (n:News) WHERE lower(n.headline) contains 'petrobras' AND n.sentiment > '0' RETURN n"
a = session.run(q)


lista = [b["n"] for b in a]

print(len(lista))

'''

for l in lista:
    try:
        print(l)
        tempo = time.localtime(int(l["datePublished"])/1000)
        tempostr = time.strftime('%Y%m%d', tempo)

        tempo = int(tempostr)
        print(tempo,tempo-5, tempo+5)

        uri = "mongodb://localhost:27017/"
        client = MongoClient(uri)
        db = client["test"]
        coll = db["acoes"]

        series = coll.find({"codneg": "PETR4", 
                            "datprg": {'$gt':tempo-5, '$lt': tempo+5} },
                            {"_id": 0} )

        j = [s for s in series]
        print(j)
        j = json.dumps(j)
        df = pd.read_json(j)

        df["preult"].plot(style='k--', label='Series') 
        df["preabe"].plot()
        pyplot.show()
    except:
        print("\n\n\ndeu ruim\n\n\n")

'''

tempo = time.localtime(int(lista[0]["datePublished"])/1000)
tempostr = time.strftime('%Y%m%d', tempo)

tempo = int(tempostr)
print(tempo,tempo-5, tempo+5)

uri = "mongodb://localhost:27017/"
client = MongoClient(uri)
db = client["test"]
coll = db["acoes"]

series = coll.find({"codneg": "PETR4", 
                    "datprg": {'$gt':tempo-5, '$lt': tempo+5} },
                    {"_id": 0} )

j = [s for s in series]
print(j)
j = json.dumps(j)
df = pd.read_json(j)

df["preult"].plot(x='data', y='value') 
df["preabe"].plot()
pyplot.show()
