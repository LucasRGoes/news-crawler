import requests
import zipfile
import io

def main():
    for year in range(1986, 2018):
        print(year)

        while True:
            try:
                url = ("http://bvmf.bmfbovespa.com.br/InstDados/SerHist/"
                       "COTAHIST_A" + str(year) + ".ZIP")
            
                r = requests.get(url)

                z = zipfile.ZipFile(io.BytesIO(r.content))
                f = z.open(z.namelist()[0])

                c = open("../txt/COTAHIST_A"+str(year)+".TXT", "wb")
                c.write(f.read())
                c.close()

                f.close()
                z.close()
            except Exception as e:
                print(e)
                continue
            break

if __name__ == "__main__":
    main()
