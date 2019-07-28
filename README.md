# River
### Experimental non text-based programming language and IDE

Read the language development blog here: https://blog.riverlanguage.org

### Using River
You can either run the dev environment from this repository directly, or just head to https://editor.riverlanguage.org to try it out.

### Setting up the dev environment
The River editor is currently a web application, built using Typescript and React. It's recommended to install the latest NodeJS environment on your machine.

```
git clone git@github.com:nicbarker/river.git
cd river/frontend
npm install
npm run start-webpack
```

You should see the river editor running at `http://localhost:8080`.

Good luck!

### Contributing
The master branch of River is protected, and all pull requests will need to be approved before being merged.

I'm currently working using both release branches and feature branches. If you're keen to contribute to the current release, please open a pull request for your feature or bug fix against the currently open feature branch (for example, 0.0.1).