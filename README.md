River is an experimental assembly-like programming language.

You can view the current main branch at [https://riverlanguage.org](https://riverlanguage.org)

### Overview
River is a programming language that that has three goals:
- Super fast compilation (should be instant on any modern machine for any program of any size)
- Very easy to write your own compiler or backend
    - You should be able to write a VM to execute river code with no knowledge about how modern compilers work, or language constructs such as ASTs.
    - With some knowledge of assembly you should be able to easily write your own compiler backend for a new target platform or architecture.
- An extremely labourious, verbose and low level syntax is offset with a high level editor that allows you to write software with similar speed and ease as a higher level language like C.

### Basic Code Structure
The actual river code in `.rvr` files isn't great to look at. There's no indentation, variables are only referenced by their position on the stack, there are no functions, and there is almost 1:1 river:assembly mapping (e.g. no expressions or complex syntax that maps to many instructions)

A program to print even numbers under 20:
```c
def index 32 // Define a 32 bit variable at position 0 on the stack
def mod 32 // Define a 32 bit variable at position 1 on the stack
assign var 0 = const 0 // index = 0
scope open // Open a new scope to anchor jumps
assign var 1 = var 0 // mod = index
assign var 1 % const 2 // mod %= 2
compare var 1 == const 0 // if (mod === 0)
os stdout var 0 // print(index)
assign var 0 + const 1 // index += 1
compare var 0 < const 20 // if (index < 20)
jump start // jump to the most recent scope open
scope close // close the scope and wind back the stack pointer
```

The same program in the river editor with highlighting, indentation and variable names, with the output from the executed program on the right:

<img width="1105" alt="Screen Shot 2021-12-16 at 3 40 35 PM" src="https://user-images.githubusercontent.com/2264338/146298141-9967a663-1faa-41c3-92f8-828aef04c0f7.png">

It looks better, but it's still reasonably painful and slow to write without the help of higher level language constructs such as a `for` loop.
The way that river provides these language features is through a concept called **macros.**

### Macros
Macros in river are essentially just a smart way of copy pasting code around. They have two main features:
- When they appear in code, macros are [folded](https://en.wikipedia.org/wiki/Code_folding) down into a single line and represented by the name of the macro.
- Macros can use a concept called "placeholders" which allow you to replace specific parts of instructions in the macro. They're kind of like function arguments.

Here is an example of a standard macro defined in river which is called `for`, used to imitate the behaviour of a [for loop](https://en.wikipedia.org/wiki/For_loop) in other languages.

<img width="549" alt="Screen Shot 2021-12-16 at 4 02 04 PM" src="https://user-images.githubusercontent.com/2264338/146300455-4a241877-0e7c-4c94-9d10-07fb2899f393.png">

You can see that the macro does a number of things, such as defining and incrementing variables. Notice the **placeholder** values denoted by the `_` and the purple highlighting. **Placeholders** are values that are exposed and replaceable even when the macro is folded. This macro also includes a **placeholder block** denoted by `_block` that allows you to add multiple instructions at that position.

When we apply the `for` macro to our code, it first appears like this:

<img width="635" alt="Screen Shot 2021-12-16 at 4 05 43 PM" src="https://user-images.githubusercontent.com/2264338/146300793-58927c00-757b-4dd3-a3ad-4b3cbeae750a.png">

Notice how there are 3 exposed placeholder values after `for`? These function as replacements for the values you would expect in a standard loop of the format:

`for (let i = initial; i < max; i += increment) {`

Below the folded macro line there are braces `{` and `}` indicating that there is a block placeholder, and you can see line `4` is exposed for you to place code into.

Here is our previous code to print even numbers under 20, but this time using the `for` macro:

<img width="1197" alt="Screen Shot 2021-12-16 at 4 24 16 PM" src="https://user-images.githubusercontent.com/2264338/146302626-d58acd6d-0ce2-4f07-ab35-ee234a688a75.png">

It's starting to look a lot more like a programming language. Currently you can use the `escape` key to toggle macro folding / unfolding:

![Dec-16-2021 16-27-47](https://user-images.githubusercontent.com/2264338/146302962-a0bac0fe-ddba-4809-a9ba-2dbd4d3d2fb6.gif)

### Running your code
You can run your .rvr code in two ways:
- The editor has a built in "virtual machine" which you can use to execute your code and see the output, in the `VM` tab.
- The `Assembly` tab provides live output of the corresponding assembly for your chosen target architecture and platform. At the moment river compiles to [nasm](https://www.nasm.us/) assembly, but I'm not sure if it'll stay like that in future.

You can see the corresponding assembly instructions highlighted in the asm tab as you're browsing the code:

![Dec-16-2021 16-38-53](https://user-images.githubusercontent.com/2264338/146304092-a9fb1ad3-0753-4cf2-9336-f8f9fbd9a664.gif)

### Future

River is currently full of bugs and incomplete functionality. Some of the next features for development are:
- Using macros inside other macros
- Saving / loading files
- WebAssembly backend target
- Types (floating point and signed integers first)
- Structs or something similar to structs
- More standard macros
- The `temp` variable type
- The `macro` variable type for expression-like usage
