#[macro_use]
extern crate serde_derive;

extern crate serde;
extern crate serde_json;

use std::fs::File;
use std::collections::HashMap;
use std::path::Path;
use std::env;
use std::io::prelude::*;
use std::fs::OpenOptions;
use std::ffi::OsStr;
use std::process::Command;

#[derive(Deserialize, Debug)]
struct RawTextBlock {
    value: String,
}

#[derive(Deserialize, Debug)]
struct VariableReferenceTextBlock {
    nodeId: String,
}

#[derive(Deserialize, Debug)]
#[serde(tag = "textBlockType")]
enum TextBlockType {
    RawTextBlock(RawTextBlock),
    VariableReferenceTextBlock(VariableReferenceTextBlock),
}

#[derive(Deserialize, Debug)]
struct TextBlock {
    id: String,
    #[serde(flatten)]
    props: TextBlockType
}

#[derive(Deserialize, Debug)]
struct EmptyNode;

#[derive(Deserialize, Debug)]
struct LogNode {
    message: Vec<TextBlock>,
}

#[derive(Deserialize, Debug)]
enum VariableValueType {
    text,
}

#[derive(Deserialize, Debug)]
struct CreateVariableNode {
    label: String,
    valueType: VariableValueType,
    value: Vec<TextBlock>,
    runtimeValue: Option<String>
}

#[derive(Deserialize, Debug)]
#[serde(tag = "conditionalType")]
enum Conditional<T = Vec<TextBlock>> {
    EmptyConditional(EmptyConditional),
    EqualsConditional(EqualsConditional<T>),
    NotEqualsConditional(NotEqualsConditional<T>)
}

#[derive(Deserialize, Debug)]
struct EmptyConditional;

#[derive(Deserialize, Debug)]
struct EqualsConditional<T> {
    leftSide: T,
    rightSide: T
}

#[derive(Deserialize, Debug)]
struct NotEqualsConditional<T> {
    leftSide: T,
    rightSide: T
}

#[derive(Deserialize, Debug)]
#[serde(tag = "nodeType")]
enum NodeType {
    EmptyNode(EmptyNode),
    LogNode(LogNode),
    CreateVariableNode(CreateVariableNode),
}

#[derive(Deserialize, Debug)]
struct RiverNode {
    id: String,
    nextNodeId: Option<String>,
    entryPoint: Option<bool>,
    conditional: Option<Conditional>,
    #[serde(flatten)]
    props: NodeType,
}

type RiverProgram = HashMap<String, RiverNode>;

static top: &str = r#"use std::fs::File;
use std::collections::HashMap;
struct RawTextBlock {
    value: String,
}

struct VariableReferenceTextBlock {
    nodeId: String,
}

enum TextBlockType {
    RawTextBlock(RawTextBlock),
    VariableReferenceTextBlock(VariableReferenceTextBlock),
}

struct TextBlock {
    id: String,
    props: TextBlockType
}

struct EmptyNode;

struct LogNode {
    message: Vec<TextBlock>,
}

enum VariableValueType {
    text,
}

struct CreateVariableNode {
    label: String,
    valueType: VariableValueType,
    value: Vec<TextBlock>
}

enum Conditional<T = Vec<TextBlock>> {
    EmptyConditional(EmptyConditional),
    EqualsConditional(EqualsConditional<T>),
    NotEqualsConditional(NotEqualsConditional<T>)
}

struct EmptyConditional;

struct EqualsConditional<T> {
    leftSide: T,
    rightSide: T
}

struct NotEqualsConditional<T> {
    leftSide: T,
    rightSide: T
}

enum NodeType {
    EmptyNode(EmptyNode),
    LogNode(LogNode),
    CreateVariableNode(CreateVariableNode),
}

struct RiverNode {
    id: String,
    nextNodeId: Option<String>,
    entryPoint: Option<bool>,
    conditional: Option<Conditional>,
    props: NodeType,
}

type RiverProgram = HashMap<String, RiverNode>;

fn main() {
    let mut program: RiverProgram = HashMap::new();
"#;

static bottom: &str = r#"
    let mut entryPointKey: Option<String> = None;
    for (key, value) in &program {
        match value.entryPoint {
            Some(_bool) => entryPointKey = Some(key.to_string()),
            None => ()
        }
    }

    fn renderTextChain (variableValues: &HashMap<String, String>, textChain: &Vec<TextBlock>) -> String {
        let mut currentString: String = String::from("");
        for block in textChain.iter() {
            match &block.props {
                TextBlockType::RawTextBlock(block) => {
                    currentString+= &block.value;
                },
                TextBlockType::VariableReferenceTextBlock(block) => {
                    currentString+= variableValues.get(&block.nodeId).unwrap();
                }
            }
        }
        return currentString
    }

    if let Some(entryPointKey) = entryPointKey {
        let mut variableValues: HashMap<String, String> = HashMap::new();
        
        fn executeNode(node: &RiverNode, program: &RiverProgram, variableValues: &mut HashMap<String, String>) {
            if node.conditional.is_some() {
                match &node.conditional.as_ref().unwrap() {
                    Conditional::EmptyConditional(_) => (),
                    Conditional::EqualsConditional(equals) => {
                        let leftSide = renderTextChain(variableValues, &equals.leftSide);
                        let rightSide = renderTextChain(variableValues, &equals.rightSide);
                        if leftSide != rightSide {
                            if node.nextNodeId.is_some() {
                                let nextNodeId = node.nextNodeId.clone().unwrap().to_string();
                                executeNode(program.get(&nextNodeId).unwrap(), program, variableValues)
                            }
                            return
                        }
                    }
                    Conditional::NotEqualsConditional(equals) => {
                        let leftSide = renderTextChain(variableValues, &equals.leftSide);
                        let rightSide = renderTextChain(variableValues, &equals.rightSide);
                        if leftSide == rightSide {
                            if node.nextNodeId.is_some() {
                                let nextNodeId = node.nextNodeId.clone().unwrap().to_string();
                                executeNode(program.get(&nextNodeId).unwrap(), program, variableValues)
                            }
                            return
                        }
                    }
                }
            }

            match &node.props {
                NodeType::EmptyNode(_node) => (),
                NodeType::LogNode(node) => {
                    println!("{}", renderTextChain(variableValues, &node.message));
                },
                NodeType::CreateVariableNode(createVariableNode) => {
                    match createVariableNode.valueType {
                        VariableValueType::text => {
                            variableValues.insert(node.id.clone(), renderTextChain(variableValues, &createVariableNode.value));
                        }
                    }
                }
            }

            if node.nextNodeId.is_some() {
                let nextNodeId = node.nextNodeId.clone().unwrap().to_string();
                executeNode(program.get(&nextNodeId).unwrap(), program, variableValues)
            }
        }

        executeNode(program.get(&entryPointKey).unwrap(), &program, &mut variableValues)
    }
}"#;

fn main() -> std::io::Result<()> {
    let args: Vec<String> = env::args().collect();
    let json_file_path = Path::new(&args[1]);
    let json_file = File::open(&json_file_path).expect("file not found");
    let mut program: RiverProgram =
        serde_json::from_reader(json_file).expect("error while reading json");
    let increment = 0;

    let fileName: String = format!("out/riverprogram.rs");
    let mut file = OpenOptions::new()
        .create(true)
        .write(true)
        .truncate(true)
        .open(&fileName)
        .unwrap();

    fn renderTextChainAsCode (toOutput: &mut String, textChain: &Vec<TextBlock>) {
        for textBlock in textChain {
            toOutput.push_str(&format!("TextBlock {{\n"));
            toOutput.push_str(&format!("id: String::from(\"{}\"),\n", textBlock.id));
            match &textBlock.props {
                TextBlockType::RawTextBlock(raw) => {
                    toOutput.push_str(&format!("props: TextBlockType::RawTextBlock(\n"));
                    toOutput.push_str(&format!("RawTextBlock {{\n"));
                    toOutput.push_str(&format!("value: String::from(\"{}\"),\n", raw.value));
                    toOutput.push_str(&format!("}}\n"));
                    toOutput.push_str(&format!(")\n"));
                    toOutput.push_str(&format!("}},\n"));
                }
                TextBlockType::VariableReferenceTextBlock(raw) => {
                    toOutput.push_str(&format!("props: TextBlockType::VariableReferenceTextBlock(\n"));
                    toOutput.push_str(&format!("VariableReferenceTextBlock {{\n"));
                    toOutput.push_str(&format!("nodeId: String::from(\"{}\"),\n", raw.nodeId));
                    toOutput.push_str(&format!("}}\n"));
                    toOutput.push_str(&format!(")\n"));
                    toOutput.push_str(&format!("}},\n"));
                }
            }
        }
    }

    let mut toOutput: String = String::from(top);

    for (key, value) in &program {
        let node: &RiverNode = program.get(key).unwrap();
        toOutput.push_str(&format!("program.insert(String::from(\"{}\"), RiverNode {{\n", node.id));
        toOutput.push_str(&format!("id: String::from(\"{}\"),\n", node.id));
        toOutput.push_str(&format!("nextNodeId: {},\n", if node.nextNodeId.is_some() { format!("{}{}{}", "Some(String::from(\"", node.nextNodeId.as_ref().unwrap(), "\"))") } else { String::from("None") }));
        toOutput.push_str(&format!("entryPoint: {:#?},\n", node.entryPoint));
        if node.conditional.is_some() {
            toOutput.push_str("conditional: ");
            match node.conditional.as_ref().unwrap() {
                Conditional::EmptyConditional(_) => { toOutput.push_str(&format!("Some(Conditional::EmptyConditional(\n EmptyConditional {{\n")) },
                Conditional::EqualsConditional(equals) => {
                    toOutput.push_str(&format!("Some(Conditional::EqualsConditional(\n"));
                    toOutput.push_str(&format!("EqualsConditional {{\n"));
                    toOutput.push_str(&format!("leftSide: vec![\n"));
                    renderTextChainAsCode(&mut toOutput, &equals.leftSide);
                    toOutput.push_str(&format!("],\n"));
                    toOutput.push_str(&format!("rightSide: vec![\n"));
                    renderTextChainAsCode(&mut toOutput, &equals.rightSide);
                    toOutput.push_str(&format!("]\n"));
                },
                Conditional::NotEqualsConditional(notEquals) => {
                    toOutput.push_str(&format!("Conditional::NotEqualsConditional(\n"));
                    toOutput.push_str(&format!("NotEqualsConditional {{\n"));
                    toOutput.push_str(&format!("leftSide: vec![\n"));
                    renderTextChainAsCode(&mut toOutput, &notEquals.leftSide);
                    toOutput.push_str(&format!("],\n"));
                    toOutput.push_str(&format!("rightSide: vec![\n"));
                    renderTextChainAsCode(&mut toOutput, &notEquals.rightSide);
                    toOutput.push_str(&format!("]\n"));
                },
            }
            toOutput.push_str(&format!("}},\n"));
            toOutput.push_str(&format!(")),\n"));
        } else {
            toOutput.push_str("conditional: None,\n");
        }
        toOutput.push_str(&format!("props: "));
        match &node.props {
            NodeType::EmptyNode(_node) => (),
            NodeType::LogNode(node) => {
                toOutput.push_str(&format!("NodeType::LogNode(\n"));
                toOutput.push_str(&format!("LogNode {{\n"));
                toOutput.push_str(&format!("message: vec![\n"));
                renderTextChainAsCode(&mut toOutput, &node.message);
                toOutput.push_str(&format!("]\n"));
            },
            NodeType::CreateVariableNode(createVariableNode) => {
                toOutput.push_str(&format!("NodeType::CreateVariableNode(\n"));
                toOutput.push_str(&format!("CreateVariableNode {{\n"));
                toOutput.push_str(&format!("label: String::from(\"{}\"),\n", createVariableNode.label));
                match createVariableNode.valueType {
                    VariableValueType::text => {
                        toOutput.push_str(&format!(" valueType: VariableValueType::text,\n"));
                        toOutput.push_str(&format!("value: vec![\n"));
                        renderTextChainAsCode(&mut toOutput, &createVariableNode.value);
                        toOutput.push_str(&format!("]\n"));
                    }
                }
            }
        }
        toOutput.push_str(&format!("}},\n"));
        toOutput.push_str(&format!("),\n"));
        toOutput.push_str(&format!("}}\n"));
        toOutput.push_str(&format!(");\n"));
    }

    toOutput.push_str(&bottom);

    writeln!(file, "{}", toOutput)?;

    Command::new("rustc")
            .arg(&fileName)
            .spawn()
            .expect("rustc failed");
    
    Ok(())
}