from flask import Flask, request, jsonify
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
import time
import random
import datetime
import os
import requests
app = Flask(__name__)

# Function to add random delays
def random_delay(min_delay=1, max_delay=3):
    time.sleep(random.uniform(min_delay, max_delay))

# Function to randomize mouse movements
def random_mouse_movements(driver):
    action = ActionChains(driver)
    for _ in range(random.randint(5, 10)):
        x_offset = random.randint(-10, 10)
        y_offset = random.randint(-10, 10)
        action.move_by_offset(x_offset, y_offset).perform()
        time.sleep(random.uniform(0.1, 0.5))

@app.route('/run_bot', methods=['POST'])
def run_bot():
    try:
        # Get the current date and time
        current_date, current_time = datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S").split(" ")
        day, month, year = current_date.split("/")

        options = webdriver.ChromeOptions()
        options.add_argument("start-maximized")
        options.add_argument("disable-infobars")
        options.add_argument("--disable-extensions")
        options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")

        # Set download directory
        download_directory = os.path.abspath("./uploads")
        prefs = {'download.default_directory': download_directory}
        options.add_experimental_option("prefs", prefs)

        driver = webdriver.Chrome(options=options)

        # Navigate to SharePoint login page
        print("Navigating to SharePoint login page...")
        driver.get("https://login.microsoftonline.com/")
        random_delay()

        # Wait for the username field and enter username
        print("Entering username...")
        WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "i0116"))).send_keys("oumeima.rachdi@microcred.com.tn")
        random_delay()

        # Click next button
        print("Clicking next button...")
        driver.find_element(By.ID, "idSIButton9").click()
        random_delay()

        # Wait for the password field and enter password
        print("Entering password...")
        WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "i0118"))).send_keys("Microcredoum2024*")
        random_delay()

        # Click the login button
        print("Clicking login button...")
        driver.find_element(By.ID, "idSIButton9").click()
        random_delay()
        driver.find_element(By.ID, "idSIButton9").click()
        random_delay()

        # Open a new tab and navigate to the given SharePoint site URL
        print("Opening new tab and navigating to SharePoint site...")
        sharepoint_site_url = "https://microcredtunisie.sharepoint.com/sites/Assurances/Documents%20partages/Forms/AllItems.aspx"
        driver.execute_script(f"window.open('{sharepoint_site_url}', '_blank');")
        random_delay()

        # Switch to the new tab
        print("Switching to the new tab...")
        driver.switch_to.window(driver.window_handles[-1])
        random_delay()

        # Click on the Hayett Daily button
        print("Clicking on the 'Hayett Daily' button...")
        hayett_daily_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[@title='Hayett Daily']"))
        )
        hayett_daily_button.click()
        random_delay()

        # Click on the year button
        print(f"Clicking on the year button: {year}...")
        year_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, f"//button[@title='{year}']"))
        )
        year_button.click()
        random_delay()

        # Click on the month button
        print(f"Clicking on the month button: {month}...")
        month_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, f"//button[@title='{month}']"))
        )
        month_button.click()
        random_delay()

        print(f"Clicking on the day button: {day}...")
        day_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, f"//button[@title='{year}{month}{day}']"))
        )

        # Right-click on the day button
        print("Right-clicking on the day button...")
        actions = ActionChains(driver)
        actions.context_click(day_button).perform()
        random_delay()

        # Click on the "Télécharger" button in the context menu
        print("Clicking on the 'Télécharger' button...")
        download_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//span[contains(text(), 'Télécharger')]"))
        )
        download_button.click()
        random_delay()

        # Wait for the download to start
        print("Waiting for the download to start...")
        print("Waiting for the site to load and performing actions...")
        time.sleep(60)
        
        # After all actions are completed:
        driver.quit()

        #Notify the NodeJS server that the bot has completed its task
        response = requests.post('http://localhost:4000/notify', json={'message': 'The bot has finished its work.'})

        if response.status_code == 200:
            print("Email sent successfully")
        else:
            print("Error sending email")

        return jsonify({"status": "success", "message": "Bot completed its task successfully"}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

