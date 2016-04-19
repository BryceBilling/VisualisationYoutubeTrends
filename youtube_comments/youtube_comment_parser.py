import argparse
import datetime
import time
from googleapiclient.discovery import build
import iso8601
import MySQLdb

REGION = "ZA"
YOUTUBE_API_SERVICE_NAME = "youtube"
YOUTUBE_API_VERSION = "v3"
DATE_FORMAT = "%Y-%m-%d"
START_DATE = datetime.date(2016, 02, 26)

parser = argparse.ArgumentParser(description='Process collected youtube comments into a csv file')
parser.add_argument('--video-id', '-vid', type=str, required=True, help='Video id to process')
args = parser.parse_args()

with open('google_api_key.txt', 'r') as api_key_file:
    DEVELOPER_KEY = api_key_file.read().replace('\n', '')

with open('database_password.txt', 'r') as database_password_file:
    DATABASE_PASSWORD = database_password_file.read().replace('\n', '')

youtube = build(YOUTUBE_API_SERVICE_NAME, YOUTUBE_API_VERSION, developerKey=DEVELOPER_KEY)

videos_list_response = youtube.videos().list(
        id=args.video_id,
        regionCode=REGION,
        part="id, snippet"
).execute()

db = MySQLdb.connect("localhost", "root", DATABASE_PASSWORD, "visualisation")
cursor = db.cursor()
publish_date = iso8601.parse_date(videos_list_response["items"][0]["snippet"]["publishedAt"])
publish_date = datetime.date(publish_date.year, publish_date.month, publish_date.day)
filename = "parsed_video_{0}_{1}.csv".format(args.video_id, time.strftime("%Y-%m-%d-%H-%M-%S", time.localtime()))
sql_count_statement = """SELECT COUNT(id) from youtube_comments WHERE video_id = %s AND date_published BETWEEN %s AND %s"""
max_count = -1;
current_date = datetime.date(START_DATE.year, START_DATE.month, START_DATE.day)

while current_date >= publish_date:
    cursor.execute(sql_count_statement, (args.video_id, datetime.date.strftime(current_date, DATE_FORMAT+" 00:00:00"), datetime.date.strftime(current_date, DATE_FORMAT+" 23:59:59")))
    count = cursor.fetchone()[0]
    current_date = current_date - datetime.timedelta(days=1)
    if count > max_count:
        max_count = count

print("Max count: {0}".format(max_count))
current_date = datetime.date(START_DATE.year, START_DATE.month, START_DATE.day)
with open(filename, 'w') as outfile:
    outfile.write("date_published,comment_count,popularity_index\n")

    while current_date >= publish_date:
        cursor.execute(sql_count_statement, (args.video_id, datetime.date.strftime(current_date, DATE_FORMAT+" 00:00:00"), datetime.date.strftime(current_date, DATE_FORMAT+" 23:59:59")))
        count = cursor.fetchone()[0]
        outfile.write("{0},{1},{2}\n".format(datetime.date.strftime(current_date, DATE_FORMAT), count, (count/(max_count*1.0))*100.0) if max_count > 0 else 0)
        current_date = current_date - datetime.timedelta(days=1)
        print(current_date)

