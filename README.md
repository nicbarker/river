River is an experimental assembly-like programming language.

You can view the current main branch at [https://riverlanguage.org](https://riverlanguage.org)

<img width="1216" alt="Screen Shot 2021-12-16 at 5 53 18 PM" src="https://user-images.githubusercontent.com/2264338/146310470-41ea4153-2ca8-4cb9-b8a8-5f6447501c34.png">

### Overview

River is a programming language that that has three core goals:

- **Fast and easy compilation** - should be functionally instant on any modern machine for any program of any size, and easy to write your own compiler or backend with no programming language experience.
- **Not text based** - the language is built up from atomic tokens not ASCII text and needs to be written using a special editor. The goal is to avoid a number of issues caused by ASCII text such as typos, arguments about formatting / indentation, name resolution, and compilation complexity.
- **Customisable control flow** - the majority of the control flow and language structure is defined by the user as part of the program with the **macro** concept, instead of being built into the language.

### Controls

At the moment River only supports keyboard interactions for the main editor.

#### Cursor

The "cursor" is simply the currently highlighted instruction fragment.

![Dec-22-2021 16-58-19](https://user-images.githubusercontent.com/2264338/147033316-733a2a6a-f44d-45f3-81c1-e8b3dbd98f24.gif)

Use the **arrow keys** to move the cursor between instructions and fragments - keyboard shortcuts will apply to the current selection.

The `Enter` key is used to create a new instruction _after_ the current one, a lot like a newline in a text file. `Shift + Enter` creates a new instruction _before_ the current one.

#### Auto complete

When you see values separated by a vertical bar inside the cursor, this indicates that there are values available for auto completion.
In the case of a finite number of selections (such as instruction types) they are hotkeyed by the first letter.

<img width="569" alt="Screen Shot 2021-12-22 at 4 56 21 PM" src="https://user-images.githubusercontent.com/2264338/147033150-93aa05b4-7dd2-4809-b8a2-4ecbaeb99da3.png">

_(the instruction types above would be hotkeyed with `s`, `d`, `a`, `c` etc)_

In the case of searchable values such as variable names, you can type alpha numeric keys to narrow down the list, and the `enter` key will select the first matched value.

<img width="481" alt="Screen Shot 2021-12-22 at 5 10 11 PM" src="https://user-images.githubusercontent.com/2264338/147034181-315d4d98-a511-43c2-9608-aa9fb75e0565.png">

#### Selection

You can select multiple lines by holding the **shift** key and using the `up` and `down` arrow.

![Dec-23-2021 07-47-22](https://user-images.githubusercontent.com/2264338/147140717-91162033-2eef-4477-a8f9-15953fc6868d.gif)

Once you've selected multiple lines, you can delete them all by pressing the `backspace` key, or create a new **macro** from the selected lines by pressing the `m` key.

### Instructions

As an assembly like programming language, river has no control structures, no functions and a very small set of **instructions** for doing work.
River is formatted with 1 instruction per line, and instructions are made up of `fragments` which are seperated by spaces.
e.g the following is a `def` instruction, with three fragments:
`def index 32`

The 5 basic instructions in river are:

#### `def`

usage: `def [variable name] [8 | 16 | 32 | 64]`

e.g. `def index 32`

Used to define variables and indicate their size in **bits** on the stack. Currently there are only 4 sizes of unsigned int available to use, but eventually fragment 3 will be replaced with a `type`.

#### `assign`

usage: `assign [var] [= | + | - | * | / | %] [var | const]`

e.g. `assign var 0 = const 5`

Used to modify a value defined with `def`. Note that this modification, like in assembly, happens _in place_. The original value is not preserved.
For example, `assign var 0 + const 1` would increment the variable at position 0 on the stack by `1`. The second operand can either be another variable or a constant value.

#### `compare`

usage: `compare [var | const] [= | != | < | <= | > | >=] [var | const]`

e.g. `compare var 0 < const 20`

Performs a mathematical comparison and only runs the next instruction if the comparison returns `true`. For example:

```
compare const 10 > const 20
assign var 0 = 10
```

The `assign` instruction here will never execute because `10 > 20` will never be `true`.

#### `scope`

usage: `scope [open | close]`

e.g. `scope open`

Scopes in river are used to define boundaries for memory management and `jump` instructions, and visibility of variables (they are lexical scopes). Any `def` instructions that occur after a `scope open` will be deallocated at the corresponding `scope close`.

#### `jump`

usage: `jump [start | end]`

e.g. `jump start`

Think `goto`, but safer and easier to use. `jump` either moves execution back to the beginning of the current `scope`, or to the end of the current `scope`. Used to construct control flow similar to `while` or `for`.

### Value Fragments

When an instruction needs to reference a **value**, such as in `compare` or `assign`, you can provide either:

- a _variable_ with the keyword `var` followed by the variable's position on the stack, e.g. `var 0`
- a _constant_ with the keyword `const` followed by the constant value (at this time only unsigned integers are supported) e.g. `const 5`
  _Constants_ only ever exist in registers and aren't saved to main memory, whereas all `var` values are saved to memory.

e.g. `compare var 0 > const 10` tests whether the variable at position 0 on the stack has a value that is greater than 10.

Note that the editor allows you to use <a href="#inline-macros">inline macros</a> to provide expression-line value fragments.

### Memory

River features an extremely basic memory management strategy. There is no dynamic allocation and no distinction between the stack and the heap - all defined variables are added to a linear growable memory structure at the beginning of their enclosing **scope**, and then are deallocated at the end of their enclosing **scope**.

```c
scope open // 16 bytes (2x 64 bit values) allocated here, placed on top of the stack
    def foo 64 // var 0
    def var 64 // var 1
    assign var 0 = const 5
    assign var 1 = var 0
    assign var 1 + const 5
    os stdout var 0
    os stdout var 1
scope close // 16 bytes deallocated here - highest 16 bytes removed from the stack
```

You can imagine it simply like a giant stack inside a single function. This means that all variable sizes must be known at compile time - array sizes & string sizes must be declared, and there is no such thing as dynamically resizable structures.

This of course can feel restrictive, but it makes the code much easier for the compiler to reason about, and allows us to apply things like range checks at compile time.

### Basic Code Structure

The actual river code in `.rvr` files isn't great to look at. There's no indentation, and variables are only referenced by their position on the stack.

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

<img width="533" alt="Screen Shot 2022-01-22 at 12 36 20 PM" src="https://user-images.githubusercontent.com/2264338/150613513-3a71b701-1ba5-44bc-ac1b-e76eea9eb9cc.png">

You can see that the macro does a number of things, such as defining and incrementing variables. Notice the **placeholder** values denoted by the `_` and the purple highlighting. **Placeholders** are values that are exposed and replaceable even when the macro is folded. This macro also includes a **placeholder block** denoted by `_block` that allows you to add multiple instructions at that position.

When we apply the `for` macro to our code, it first appears like this:

<img width="605" alt="Screen Shot 2022-01-22 at 12 37 27 PM" src="https://user-images.githubusercontent.com/2264338/150613567-d9feb194-3c38-4df9-bb43-176192d4f10c.png">

Notice how there are 3 exposed placeholder values after `for`? These function as replacements for the values you would expect in a standard loop of the format:

`for (let i = initial; i < max; i += increment) {`

Below the folded macro line there are braces `{` and `}` indicating that there is a block placeholder, and you can see line `5` is exposed for you to place code into.

Here is our previous code to print even numbers under 20, but this time using the `for` macro:

<img width="1019" alt="Screen Shot 2022-01-22 at 12 40 31 PM" src="https://user-images.githubusercontent.com/2264338/150613772-4b7db953-3c67-40b6-b732-dc21a950a6c9.png">

This is better, but it still feels a bit awkward to have to pre-declare a variable to hold `mod` and use multiple `assign` instructions. This is where we can use **inline macros** to condense things even more.

### Inline Macros

Standard macros in River like `for` are folded down into their own line, and wrap their contents in a `scope` so that they don't expose any variables to outside code.

_Inline Macros_ define a variable in the outer scope, and are rendered _inline_ in place of a **variable fragment.**

As an example, here is the definition of a very simple `expr` macro that can be used to construct _expressions_:

<img width="508" alt="Screen Shot 2022-01-22 at 1 02 56 PM" src="https://user-images.githubusercontent.com/2264338/150615109-c5f4f7bb-3c42-4ec6-9f6d-1e16d4517aab.png">

Anywhere that you can use a variable fragment, such as `assign` or `compare` or even in the placeholder of another macro, you can use an inline macro.

Here is an example of using the `expr` inline in place of a variable fragment in an `assign` instruction.

![Jan-22-2022 13-06-35](https://user-images.githubusercontent.com/2264338/150615378-4b7499fd-ec2b-4809-99fc-ac164553619b.gif)

Here is how you would write a standard expression assignment of `aVariable = 2 + 3` from another programming language.

![Jan-22-2022 13-07-01](https://user-images.githubusercontent.com/2264338/150615437-1fb2a812-119f-4ff4-82ae-1a9faf57527e.gif)

You can even nest inline macros inside eachother.

<img width="717" alt="Screen Shot 2022-01-22 at 1 09 03 PM" src="https://user-images.githubusercontent.com/2264338/150615505-338d4180-f645-48b6-9c43-1bafb96c0073.png">

As a result, we can now take our program that printed even numbers under 20, and condense it even further using inline macros.

<img width="967" alt="Screen Shot 2022-01-22 at 1 11 51 PM" src="https://user-images.githubusercontent.com/2264338/150615671-e5f6448c-0736-4af8-95ba-feaab8719bba.png">

It's starting to look a lot more like a programming language. You can see that we've saved quite a few lines by using the `escape` key to toggle macro folding on and off.

![Jan-22-2022 13-14-00](https://user-images.githubusercontent.com/2264338/150615797-6b079b06-9186-4209-bc70-66d169fc1921.gif)

### Running your code

You can run your .rvr code in two ways:

- The editor has a built in "virtual machine" which you can use to execute your code and see the output, in the `VM` tab.
- The `Assembly` tab provides live output of the corresponding assembly for your chosen target architecture and platform. At the moment river compiles to [nasm](https://www.nasm.us/) assembly, but I'm not sure if it'll stay like that in future.

Currently supported platforms:

- x64 (Windows)
- x64 (Mac OS X)
- WebAssembly

You can see the corresponding assembly instructions highlighted in the asm tab as you're browsing the code:

![Dec-16-2021 16-38-53](https://user-images.githubusercontent.com/2264338/146304092-a9fb1ad3-0753-4cf2-9336-f8f9fbd9a664.gif)

### Running WASM

Running WASM is a bit of a pain, but you can test out your code here:
https://webassembly.github.io/wabt/demo/wat2wasm/

Using the following javascript:

```js
const wasmInstance = new WebAssembly.Instance(wasmModule, {
  console: { log: (num) => console.log(num) },
});
const { untitled } = wasmInstance.exports;
untitled();
```

### Future

River is currently full of bugs and incomplete functionality. Some of the next features for development are:

- Examples (project euler or something)
- Saving / loading files
- WebAssembly browser / wasmtime flavours
- Types (float, signed, bool first)
- Structs or something similar to structs
- Arrays and potentially tuple types
- More standard macros
- Binary rvr file representation
