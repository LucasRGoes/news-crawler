import json
from neo4j.v1 import GraphDatabase
import glob
import csv
import os

def main():
    print("news")

    # get all news
    news = get_news()

    # convert news to csv
    news_csv(news)

    print("neo")

    # connect to neo4j
    uri = "bolt://localhost:7687"
    auth = ("neo4j", "1230")
    driver = GraphDatabase.driver(uri, auth=auth)
    session = driver.session()

    # create index
    q = "CREATE INDEX ON :News(headline)"
    tx = session.begin_transaction()
    tx.run(q)
    tx.commit()
    q = "CREATE INDEX ON :Keyword(text)"
    tx = session.begin_transaction()
    tx.run(q)
    tx.commit()
    # CALL db.indexes

    # create news and keywords
    #dbms.security.allow_csv_import_from_file_urls=true
    #dbms.directories.import=import
    f = os.path.abspath("neo.csv")
    q = ("LOAD CSV FROM 'file://" + f + "' AS row "
         "MERGE (news:News { headline: row[0], datePublished: row[1], sentiment: row[3], category: row[4] }) "
         "MERGE (keyword:Keyword { text: row[5] }) "
         "CREATE (news)-[:Presense { relevance: row[6] }]->(keyword)")
    tx = session.begin_transaction()
    tx.run(q)
    tx.commit()

def get_news():
    news = []

    # get all files
    files = glob.glob("NewsCrawled/*")

    for file in files:
        # get file news
        f = open(file, "r")
        n = json.load(f)
        f.close()

        # add news
        news += n

    return news

def news_csv(news):
    # open
    f = open("neo.csv", "w")
    writer = csv.writer(f)
    
    # write header
    writer.writerow([
        "headline", "datePublished", "content", "sentiment", "category", 
        "keyword", "relevance"])

    for n in news:
        # clean content
        content = n["content"].replace("'", "").replace('"', '')

        for k in n["keywords"]:
            # clean keyword
            keyword = k["text"].replace("'", "").replace('"', '')

            # write keyword news
            row = [
                n["headline"], n["datePublished"], content, 
                n["sentiment"]["score"], n["category"], keyword, 
                k["relevance"]]
            writer.writerow(row)

    f.close()

if __name__ == "__main__":
    main()