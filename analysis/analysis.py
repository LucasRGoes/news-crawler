from neo4j.v1 import GraphDatabase
from pymongo import MongoClient
import datetime
import matplotlib.pyplot as plt

def switch_demo(cod):
    switcher = {
        "PETR4": "Petrobras",
        "CPFE3": "CPFL Energia",
        "ITUB4": "Itau Unibanco",
        "VALE3": "Vale",
        "BRFS3": "Brazil Foods",
        "GOLL4": "Gol"
    }
    return switcher.get(cod, "Invalid company")

def main():
    
    #petrobras
    analysis("petrobras", "PETR4", datetime.datetime(2017,1,1), datetime.datetime(2018,1,1) )
    
    # CPFL
    analysis("energia", "CPFE3", datetime.datetime(2017,1,1), datetime.datetime(2018,1,1))
    
    #Itau 
    analysis("banco", "ITUB4", datetime.datetime(2017,1,1), datetime.datetime(2018,1,1))

    #Vale
    analysis("minério", "VALE3", datetime.datetime(2015,1,1), datetime.datetime(2018,1,1))

    #BRF - do not use lower in neo4j
    analysis("BRF ", "BRFS3", datetime.datetime(2015,1,1), datetime.datetime(2018,1,1))
    
    #GOL
    analysis("aviação", "GOLL4", datetime.datetime(2015,1,1), datetime.datetime(2018,1,1))
    

def analysis(company, codneg, start, end):

    print("Starting analysis {} ...".format(company))

    # connect neo4j
    neo4j = GraphDatabase.driver(
        "bolt://localhost:7687", auth=("neo4j", "1230"))

    # get news
    #q = "MATCH (n:Keyword) WHERE lower(n.text) contains 'petrobras' RETURN n"
    #q = "MATCH (n:News) WHERE n.headline = 'Bovespa fecha em leve alta; BRF cai quase 20% e perde quase R$ 5 bi em valor de mercado' RETURN n"
    #q = "MATCH (n:News) WHERE lower(n.headline) contains 'petrobras' AND n.sentiment > '0' RETURN n"
    #q = "MATCH (n:News)-[r:Presense]->(k:Keyword)  WHERE lower(k.text) contains 'petrobras' AND lower(n.headline) contains 'petrobras' RETURN n"
    
    q = ("MATCH (n:News) "
         "WHERE lower(n.headline) contains {x} AND "
         "n.sentiment <> '0' "
         "RETURN n")
    news = neo4j.session().run(q, x=company)
    news = [n["n"] for n in news]
    print(len(news), "news")
    
    # connect mongo
    mongo = MongoClient("mongodb://localhost:27017/")["test"]["acoes"]

    # get series
    series = list(mongo.find(
        {"codneg": codneg}, {"_id": 0, "preult": 1, "datprg": 1}))
    series = {datetime.datetime.strptime(str(s["datprg"]), "%Y%m%d"): 
        s["preult"] for s in series}


    #adjust start and end data
    series = {s:  series[s] for s in series if s>= start and s < end}
      
    # get closing price and date
    prices = [series[s] for s in sorted(series)]
    dates = [s for s in sorted(series)]

    # plot series
    plt.plot(dates, prices, "blue")
    #print(dates)

    for n in news:
        
        # convert news miliseconds to seconds
        date = int(n["datePublished"]) / 1000
        # remove news hours, minutes and seconds
        date -= date % (24*60*60)
        # convert news epoch to datetime
        date = datetime.datetime.utcfromtimestamp(date)

        # calculate time delta before and after the news
        space = [date + datetime.timedelta(days=i) for i in range(-3, 4)]

        # get news closing price and date in series
        price = [series[s] for s in space if s in series]
        date = [s for s in space if s in series]

        # set plot color by sentiment
        if float(n["sentiment"]) > 0:
            color = "green"
        else:
            color = "red"

        plt.plot(date, price, color, linewidth=3)
    
    # show plot
    plt.xlabel("Periodo")
    plt.ylabel("valor da Acao (R$)")
    plt.title("{}".format(switch_demo(codneg)))
    
    plt.show()

if __name__ == "__main__":
    main()