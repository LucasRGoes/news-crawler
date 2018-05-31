import csv

def main():
    for year in range(1986, 2018):
        print(year)

        f = "COTAHIST_A" + str(year) + ".TXT"
        data = load_data("../txt/" + f)

        print(data.header)
        print(data.trailer)

        csvFile = open("../csv/"+f[:-4]+".csv", "w")
        writer = csv.writer(csvFile, delimiter=",")
        writer.writerow(data.desc)
        writer.writerows(data.registers)
        csvFile.close()

class Data:
    def __init__(self):
        self.header = []
        self.trailer = []
        self.desc = []
        self.registers = []

def load_data(path):
    data = Data()

    f = open(path, encoding="latin-1")
    lines = []
    for line in f:
        lines.append(line)
    f.close()

    line = lines[0]
    data.header.append(line[0:2])
    data.header.append(line[2:15])
    data.header.append(line[15:23])
    data.header.append(line[23:31])

    line = lines[-1]
    data.trailer.append(line[0:2])
    data.trailer.append(line[2:15])
    data.trailer.append(line[15:23])
    data.trailer.append(line[23:31])
    data.trailer.append(line[31:42])

    data.desc = [
        "tipreg", "datprg", "codbdi", "codneg", "tpmerc", "nomres", "especi", 
        "prazot", "modref", "preabe", "premax", "premin", "premed", "preult", 
        "preofc", "preofv", "totneg", "quatot", "voltot", "preexe", "indopc", 
        "datven", "fatcot", "ptoexe", "codisi", "dismes"]

    for line in lines[1:-1]:
        tipreg = line[0:2]
        datprg = line[2:10]
        codbdi = line[10:12]
        codneg = line[12:24]
        tpmerc = line[24:27]
        nomres = line[27:39]
        especi = line[39:49]
        prazot = line[49:52]
        modref = line[52:56]
        preabe = line[56:69]
        premax = line[69:82]
        premin = line[82:95]
        premed = line[95:108]
        preult = line[108:121]
        preofc = line[121:134]
        preofv = line[134:147]
        totneg = line[147:152]
        quatot = line[152:170]
        voltot = line[170:188]
        preexe = line[188:201]
        indopc = line[201:202]
        datven = line[202:210]
        fatcot = line[210:217]
        ptoexe = line[217:230]
        codisi = line[230:242]
        dismes = line[242:245]
        
        codneg = codneg.strip()
        preabe = round(float(preabe[:11]) + float(preabe[11:])/100, 2)
        premax = round(float(premax[:11]) + float(premax[11:])/100, 2)
        premin = round(float(premin[:11]) + float(premin[11:])/100, 2)
        premed = round(float(premed[:11]) + float(premed[11:])/100, 2)
        preult = round(float(preult[:11]) + float(preult[11:])/100, 2)
        preofc = round(float(preofc[:11]) + float(preofc[11:])/100, 2)
        preofv = round(float(preofv[:11]) + float(preofv[11:])/100, 2)
        totneg = int(totneg)
        quatot = int(quatot)
        voltot = round(float(voltot[:16]) + float(voltot[16:])/100, 2)
        preexe = round(float(preexe[:11]) + float(preexe[11:])/100, 2)
        fatcot = int(fatcot)
        ptoexe = round(float(ptoexe[:7]) + float(ptoexe[7:])/100, 2)
        dismes = int(dismes)

        data.registers.append([
            tipreg, datprg, codbdi, codneg, tpmerc, nomres, especi, prazot, 
            modref, preabe, premax, premin, premed, preult, preofc, preofv, 
            totneg, quatot, voltot, preexe, indopc, datven, fatcot, ptoexe, 
            codisi, dismes])

    return data

if __name__ == "__main__":
    main()
