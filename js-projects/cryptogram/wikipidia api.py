import requests
import json
from tqdm import tqdm
import re



# פונקציה לקבלת קישורים מהעמוד הראשי
def get_links_from_page(page_title):
	url = "https://he.wikipedia.org/w/api.php"
	params = {
		"action": "parse",
		"format": "json",
		"page": page_title,
		"prop": "links",
		"pllimit": "max"
	}
	
	response = requests.get(url, params=params)
	data = response.json()
	# print(data)
	links = []
	if "parse" in data:
		for link in data["parse"]["links"]:
			# print(link)  # הדפסת הקישור כדי לראות את המבנה
			# לבדוק אם המפתח '*' קיים
			if "*" in link and link["ns"] == 0:  # אם זה קישור לעמוד ויקיפדיה (ולא לדף אחר)
				links.append(link["*"])
	
	return links

# פונקציה לבדוק אם הציטוט תקני (לא מכיל ניקוד, לא ארוך מדי)
def is_valid_quote(quote):
	# מסנן ציטוטים שמכילים ניקוד
	if re.search(r'[\u0591-\u05C7]', quote):  # בודק אם יש ניקוד
		return False
	# מסנן ציטוטים שמכילים יותר מ-300 תווים
	if len(quote) > 300:
		return False
	if quote.startswith("דף זה מכיל ציטוטים"):
		return False
	if re.search(r'\d', quote):  # בודק אם יש ספרות
		return False
	if re.search(r'[a-zA-Z]', quote):  # בודק אם יש אותיות באנגלית
		return False
	return True


# פונקציה לשליפת הציטוטים מעמוד
def get_quotes_from_page(page_title):
	url = "https://he.wikiquote.org/w/api.php"
	params = {
		"action": "query",
		"format": "json",
		"titles": page_title,
		"prop": "extracts",
		"exintro": True,
		"explaintext": True
	}
	
	response = requests.get(url, params=params)
	data = response.json()
	# print(page_title)
	# print(data)
	
	pages = data["query"]["pages"]
	quote_text = ""
	
	for page_id in pages:
		quote_text = pages[page_id].get("extract", "")
		
	# פיצול המחרוזת לציטוטים לפי שורות או תווים מסוימים
	quotes = [quote.strip() for quote in quote_text.split("\n") if quote.strip()]
	return quotes


# שליפה של כל הקישורים מעמוד "עמוד ראשי"
links = get_links_from_page("עמוד_ראשי")  # הכנס את שם הדף המתאים
print(len(links))

# שליפת הציטוטים מכל קישור
all_quotes = {}
for link in tqdm(links[15:]):
	catagory = "ציטוטים: " + link
	quotes = get_quotes_from_page(link)
	if quotes:
		for quote in quotes:
			# print(quote)
			if is_valid_quote(quote):  # סינון ציטוטים לא תקניים
				# עיצוב מחדש של הציטוט
				reformatted_quote = quote.strip().replace("\\", "").replace("/", "").replace("\"", "").replace('"', " ").replace("\n", " ").replace("  ", " ")
				# בדיקה ואיתחול המפתח במילון
				if catagory not in all_quotes:
					all_quotes[catagory] = []  # יצירת רשימה חדשה עבור הקטגוריה
				# הוספת הציטוט למילון
				# print(reformatted_quote)
				# print("----------")
				all_quotes[catagory].append(reformatted_quote)

		
		# all_quotes[link] = quotes

# שמירת הציטוטים בקובץ JSON בפורמט המבוקש
quotes_dict = all_quotes
with open("sentences-dictionary.json", "w", encoding="utf-8") as f:
	json.dump(quotes_dict, f, ensure_ascii=False, indent=4)
