# Hosting BentoPDF as a static website

As an alternative to runnning BenotPDF locally or in a Docker container, you can very easily host it as a set of static web pages.  Here are a few examples:

## Netlify

### Netlify - static deployment

One of simplest ways to host BentoPDF is to create a project at [Netlify](https://www.netlify.com/) and create a static deployment.  You can accomplish this by first downloading the pre-built distribution file from our [GitHub releases](https://github.com/alam00000/bentopdf/releases). Each release includes a `dist-{version}.zip` file that contains all necessary files for self-hosting.

1. Go to [BentoPDF Releases](https://github.com/alam00000/bentopdf/releases)
2. Download the latest `dist-{version}.zip` file
3. Next, if you have not already done so, create a Netlify account and log in.
4. From your Netlify projects page, add a new project and select "Deploy manually".
5. Drag and drop to upload the Bentopdf zip file you downloaded in step 3.
6. Your BentoPDF deployment should now be working! Optionally, you can go into Project Configuration and change the project name.

When a new BentoPDF release becomes available, you will need to repeat steps 1-3, then go into "Deploys" and upload the new release.

### Netlify - dynamic deployment

Alternatively, you can configure a Netlify project to automatically deploy whenever your BentoPDF is updated.

1. If you have not done so already, create a fork of BentoPDF into your own Github account.
2. If you have not already done so, create a Netlify account and log in.
3. From your Netlify projects page, add a new project and select 'Import an existing project'.
4. Select the GitHub button, authorize Netlify, then choose where to install the integration.  You can choose 'All repositories' or 'Only select repositories' and choose your BentoPDF fork.
5. Select your repo and give it a project name.  (add environment variables?)  Then click the blue 'Deploy' button.
6. The Netlify build & deploy process will kick off.  Once it finishes, you can click on the provided URL `https://[projectname]/netlify.app` to view your deployment of BentoPDF.

Whenever the BentoPDF source code is updated, you can sync the changes into your repo.  This will kick off a new build and deploy within Netlify.

If you want to use BentoPDF's simple mode, go into Deploy Settings, then Environment Variables, and Add a variable.  Add `SIMPLE_MODE` and set it to `true`.  You will need to manually kick a new build to get this to take effect.

## Vercel

Vercel provides similar services to Netlify dynamic hosting.  

1. If you have not done so already, create a fork of BentoPDF into your own Github account.
2. If you have not already done so, create a Vercel account and log in.
3. From your Vercel Overview page, select 'Add new project'
4. Under 'Import Git Repository' and then choose 'Add GitHub Account'.  Follow the prompts to authorize Vercel integration.  You can choose 'All repositories' or 'Only select repositories' and choose your BentoPDF fork.
5. Select 'Import' to import the repo into Vercel.
6. Under 'Framework Preset', select 'Vite' and save the settings.
7. The Vercel build & deploy process will kick off.  Once it finishes, you can click on the provided link to view your deployment of BentoPDF.

Whenever the BentoPDF source code is updated, you can sync the changes into your repo.  This will kick off a new build and deploy within BentoPDF.

If you want to use BentoPDF's simple mode, go into Project Settings, then Environment Variables, and Create a new variable.  Add `SIMPLE_MODE` and set it to `true`.  You will need to redeploy to get this to take effect.

## GitHub Pages

You can also host your own instance of BentoPDF using GitHub pages.  An advantage of this over the other options is you are able to do everything in GitHub without any third party service.

1. If you have not done so already, create a fork of BentoPDF into your own Github account.
2. From your fork, go to `Settings->Pages`, and change the 'Source' to 'GitHub Actions'
3. Go to `Settings->Secrets and Variables > Actions`, then select 'Variables', and add the repository variable `BASE_URL`.  Set the value to `/bentopdf`.  *If you've renamed the repo to something other than bentopdf, put that here*.
4. Go to `Actions` in the top menu, and select 'I understand' to enable Actions
5. Within Actions, on the left, select 'Deploy static content to Pages', and then on the right select 'Run workflow', and in the dropdown, 'Run Workflow'.  The action will not run to build BentoPDF and deploy it to GitHub Pages.

When the build completes, you can find the website at `https://[your-github-username]/bentopdf`

If/when you merge changes from the source BentoPDF repository, the build and deploy action will automatically be kicked off and the new version will be automatically deployed to GitHub Pages.