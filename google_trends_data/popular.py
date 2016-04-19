from pyGTrends import pyGTrends
import time
import json
import collections
from random import randint

def getFill(i):
	if i < 20:
		return "L"
	if i < 40:
		return "LM"
	if i < 60:
		return "M"
	if i < 80:
		return "MH"
	return "H"

with open('g_c.json') as data_file:
	cred = json.load(data_file)


google_username = cred['google_username']
google_password = cred['google_password']

keyword_list = [ "Gangnam Style"] # , "Blank Space", "See you Again", "Uptown Funk", "Shake it Off"]
release_date = [ "2012-07-15"] # , "2014-02-10", "2015-03-17", "2014-11-10", "2014-08-18"]
release_index = [241] #, 362, 382, 362, 350]
gprop_list = ["youtube"] #, ""]
country_list = []
country_map = {}
infi = open("codes.csv")
tx = infi.readlines()
for line in tx:
	cut = line.split(',')
	country_list.append(cut[0])
	country_map[cut[0]] = cut[1].strip()
path = "/home/calvin/Data/"

# comment/uncomment below to download

con = pyGTrends(google_username, google_password)
for k in keyword_list:
	for g in gprop_list:
		for c in country_list:
			con.request_report(k, gprop=g, geo=c)

			time.sleep(randint(4, 9))
			file_name = k + "_" + g  + "_" + c
			con.save_csv(path, file_name)


# let's parse these into a JSON file


j_m = {}
index = -1
for k in keyword_list:
	#k_map = {}
	index += 1
	g_map = {}
	for g in gprop_list:
		pop_map = []
		for c in country_list:
			file_name = path + k + "_" + g  + "_" + c
			inf = open(file_name + ".csv")
			tst = inf.readlines()
			text = ""
			if len(tst) < 5:
				continue
			if len(tst[6]) < 16:
				continue
				print tst[5:]
				for line in tst[5:]:
					text += line
					text += line
					text += line
					text += line
				print(text)
				if g=="youtube":
					ii = release_index[index] - 5
					ei = ii + 52
					if ei > 430:
						ei = 430
					text = text.splitlines()[ii:ei]
				else:
					ii = release_index[index] + 204
					ei = ii + 52
					if ei > 634:
						ei = 634
					text = text.splitlines()[ii:ei]
				# It's a month, what do?
			elif g=="youtube":
				ii = release_index[index]
				ei = ii + 52
				if ei > 430:
					ei = 430
				text = tst[ii:ei]
			else:
				ii = release_index[index] + 209
				ei = ii + 52
				if ei > 634:
					ei = 634
				text = tst[ii:ei]
			li = -1
			for line in text:
				if len(line) < 4:
					break
				li += 1
				cut = line.split(',')
				views = int(cut[1])
				cur_map = {"fillKey" : getFill(views), "popularity" : views}
				if li == len(pop_map):
					pop_map.append({country_map[c] : cur_map})
				else:
					pop_map[li][country_map[c]] = cur_map
			while li < 51:
				print(file_name)

				li += 1;
				views = 0;
				cur_map = {"fillKey" : getFill(views), "popularity" : views}
				if li == len(pop_map):
					pop_map.append({country_map[c] : cur_map})
				else:
					pop_map[li][country_map[c]] = cur_map

		if len(pop_map) > 0:
			if(g == "youtube"):
				g_map["Youtube"] = pop_map
			else:
				g_map["Google"] = pop_map
	j_m[k] = g_map

with open( path + "all.json", 'w') as fp:
	json.dump(j_m, fp)
