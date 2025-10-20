// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// This is now in lib.rs, so main.rs just needs to call the run function
use scx_recipes_lib::run;

fn main() {
    run();
}