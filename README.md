# River
### Experimental non text-based programming language and IDE

<img width="1401" alt="Screenshot 2020-03-01 21 29 51" src="https://user-images.githubusercontent.com/2264338/75622332-d10a6c80-5c03-11ea-8d75-11e605492870.png">

Read the language development blog here: https://blog.riverlanguage.org

### Using River
You can either run the dev environment from this repository directly, or just head to https://editor.riverlanguage.org to try it out.

### Setting up the dev environment
The River editor is currently a web application, built using Typescript and React. It's recommended to install the latest NodeJS environment on your machine.

```
git clone git@github.com:nicbarker/river.git
cd river/frontend
npm install
npm run dev
```

You should see the river editor running at `http://localhost:3000`.

### Compiling static binaries from .rvr files
River includes a compiler written in [Rust](https://www.rust-lang.org/) called __rvc__. You can find the source code for it in `/rvc`. You'll need to install Rust and the rust package manager, `cargo`. To compile river programs into binary executables, use the following:

```
cd rvc/
cargo build
cargo run YOUR_RVR_FILE
```

If compilation succeeds, you'll see a file with the same name as your river program in the `rvc` directory.

#### Notes on static compilation
The river compiler basically just transpiles river directly into rust code, then runs the rust compiler `rustc`. It's currently not as fast or optimised as it could be as it's basically just a direct port of the node graph from typescript (using a hashmap for the nodes).

If the compiler fails and you want to look at the generated rust code to debug, check out the files generated in the `rvc/out` directory.

### Contributing
The master branch of River is protected, and all pull requests will need to be approved before being merged.

I'm currently working using both release branches and feature branches. If you're keen to contribute to the current release, please open a pull request for your feature or bug fix against the currently open feature branch (for example, 0.0.1).
