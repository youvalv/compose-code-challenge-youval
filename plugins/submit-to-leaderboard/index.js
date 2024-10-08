const fs = require("fs");
const path = require("path");

module.exports = {
    onPreBuild: async () => {        
        // Stash some env vars for later when they are not usually available to use
        const filePath = path.join(__dirname, "../../netlify/data.json");
        
        // normalize the repo URL to be a public https URL
        let repoURL = process.env.REPOSITORY_URL;
        if (repoURL.startsWith("git@github.com:")) {
            repoURL = "https://github.com/" + repoURL.split(":")[1];
            console.log(`Formatting repoURL from ${process.env.REPOSITORY_URL} to ${repoURL}`);
        }
        const content = { "default" : {
                "repoURL": repoURL
            }
        };

        fs.writeFile(filePath, JSON.stringify(content), (err) => {
            if (err) {
                console.error("Error stashing repo url to data file:", err);
            }
        });
  },

  onSuccess: async ({ constants }) => {

    console.log("Build success, time to report this site to the leaderboard");

    // If the site has been deployed, we'll send the score to the leaderboard
    if (constants.IS_LOCAL) {
      console.log(
        "Local build. We'll only tell the leaderboard if it's deployed.",
      );
      return;
    }

    // Normalize the URL to remove any protocol differences
    const url = new URL(process.env.URL);
    const siteURL = `https://${url.hostname}`;

    console.log(`Registering ${siteURL} in the leaderboard`);

    
    await fetch("https://compose-challenge.netlify.app/submission", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: siteURL,
        excluded: false,
      }),
    });
  },
};