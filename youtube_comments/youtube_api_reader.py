from googleapiclient.discovery import build  # pip install google-api-python-client
from googleapiclient.errors import HttpError  # pip install google-api-python-client
from oauth2client.tools import argparser  # pip install oauth2client
import time
import pprint
import sys
import json
import datetime
import MySQLdb # pip install mysqlclient
import iso8601 # pip install iso8601

# Set DEVELOPER_KEY to the API key value from the APIs & auth > Registered apps
# tab of
# https://cloud.google.com/console
# Please ensure that you have enabled the YouTube Data API for your project.

with open('google_api_key.txt', 'r') as api_key_file:
    DEVELOPER_KEY = api_key_file.read().replace('\n', '')

with open('database_password.txt', 'r') as database_password_file:
    DATABASE_PASSWORD = database_password_file.read().replace('\n', '')

YOUTUBE_API_SERVICE_NAME = "youtube"
YOUTUBE_API_VERSION = "v3"
REGION = "ZA"

pp = pprint.PrettyPrinter(indent=4)

# change the default to the search term to search
argparser.add_argument("--q", help="Search term", default="gangnam style")

# default number of results which are returned. It can very from 0 - 100
argparser.add_argument("--max-results", help="Max results", default=1)

args = argparser.parse_args()
options = args
youtube = build(YOUTUBE_API_SERVICE_NAME, YOUTUBE_API_VERSION, developerKey=DEVELOPER_KEY)

# Call the search.list method to retrieve results matching the specified
# query term.
search_response = youtube.search().list(
        q=options.q,
        type="video",
        part="id,snippet",
        regionCode=REGION,
        maxResults=options.max_results
).execute()

categories = youtube.videoCategories().list(
        part="id,snippet",
        regionCode=REGION,
).execute()

videos = {}
# Add each result to the appropriate list, and then display the lists of
# matching videos.
# Filter out channels, and playlist.
for search_result in search_response.get("items", []):
    if search_result["id"]["kind"] == "youtube#video":
        videos[search_result["id"]["videoId"]] = search_result["snippet"]["title"]

# Fetches video metadata
video_id = ','.join(videos.keys())
videos_list_response = youtube.videos().list(
        id=video_id,
        regionCode=REGION,
        part='contentDetails, id, liveStreamingDetails, localizations, player, recordingDetails, snippet, statistics, status, topicDetails'
).execute()

# Convert categoryID to a textual description
for item in videos_list_response["items"]:
    for category in categories["items"]:
        if item["snippet"]["categoryId"] == category["id"]:
            item["snippet"]["categoryId"] = category["snippet"]["title"]
            break

# pp.pprint(videos_list_response)

# Fetch all the comments for a given video
comments = []
next_page_token = None
counter = 0
total_parsed = 0;
filename = "Comments_{0}.txt".format(time.strftime("%Y-%m-%d-%H-%M-%S", time.localtime()))

db = MySQLdb.connect("localhost", "root", DATABASE_PASSWORD, "visualisation")

# prepare a cursor object using cursor() method
cursor = db.cursor()

# Hardcode for testing
# video_id = "vDlMLqdvHzI"

# Keep polling until all results have been obtained
while next_page_token is not None or counter == 0:
    counter += 1
    comment_list_response = None
    keep_trying = True

    # Keep making the call until the api provides the result
    # Helps account for various 400 and 500 errors that can occur
    while keep_trying:
        try:
            comment_list_response = youtube.commentThreads().list(
                    part="id, snippet, replies",
                    videoId=video_id,
                    pageToken=next_page_token,
                    maxResults=100,
                    order="time",
                    textFormat="plainText"
            ).execute()
            keep_trying = False
        except Exception as e:
            print("Exception occurred getting comments: {0}".format(str(e)))

    next_page_token = comment_list_response.get("nextPageToken")
    comments = comment_list_response["items"]
    total_parsed += len(comments)

    # Get all the replies to this comment
    for comment in comments:
        # Add to database

        published_date = iso8601.parse_date(comment["snippet"]["topLevelComment"]["snippet"]["publishedAt"])
        try:
            # Execute the SQL command
            cursor.execute("""INSERT INTO youtube_comments(date_published, comment_id, parent_comment_id, like_count, video_id) VALUES (%s, %s, %s, %s, %s)""",
                           (published_date.strftime('%Y-%m-%d %H:%M:%S'), comment["id"], None, str(comment["snippet"]["topLevelComment"]["snippet"]["likeCount"]), video_id))
            # Commit your changes in the database
            db.commit()
        except Exception as e:
            # Rollback in case there is any error
            print("db rollback")
            print(e)
            db.rollback()

        replies = comment.get("replies")
        if replies is not None:
            next_reply_token = None
            reply_counter = 0
            # Keep getting replies until we have them all
            while next_reply_token is not None or reply_counter == 0:
                reply_counter += 1
                keep_trying = True
                comment_reply_response = None

                # Keep polling for replies
                while keep_trying:
                    try:
                        comment_reply_response = youtube.comments().list(
                                part="id, snippet",
                                parentId=comment["id"],
                                pageToken=next_reply_token,
                                maxResults=100,
                                textFormat="plainText"
                        ).execute()
                        keep_trying = False
                    except Exception as e:
                        print("Exception occurred getting replies: {0}".format(str(e)))

                next_reply_token = comment_reply_response.get("nextPageToken")

                # Add reply to database
                replies = comment_reply_response["items"]
                total_parsed += len(replies)
                for reply in replies:
                    published_date = iso8601.parse_date(reply["snippet"]["publishedAt"])
                    try:
                        # Execute the SQL command
                        cursor.execute("""INSERT INTO youtube_comments(date_published, comment_id, parent_comment_id, like_count, video_id) VALUES (%s, %s, %s, %s, %s)""",
                                       (published_date.strftime('%Y-%m-%d %H:%M:%S'), reply["id"], reply["snippet"]["parentId"], str(reply["snippet"]["likeCount"]),
                                        video_id))
                        # Commit your changes in the database
                        db.commit()
                    except Exception as e:
                        # Rollback in   Q    case there is any error
                        print("reply db rollback")
                        print(e)
                        db.rollback()

    print(total_parsed)
