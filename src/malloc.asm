; --------------------------------------------------          
; Generated with river compiler 1.0          
; Targeting x64_OSX with assembler nasm 2.15.05          
; nasm -fmacho64 untitled.asm && gcc untitled.o          
; --------------------------------------------------          
          global    _main
          extern    _malloc, _printf
                    
          section   .text
_main:              
          push      rbx
          mov       rdi, 48
          call      _malloc
          pop       rbx
          mov       r12, rax
j0:                 
          ; 4: assign var 1 = const 1
          mov       qword [r12 + 8], 1
          ; 5: assign var 2 = const 2
          mov       qword [r12 + 16], 2
j6:                 
          ; 9: assign var 4 = var 1
          mov       r13, qword [r12 + 8]
          mov       [r12 + 32], r13
          ; 10: assign var 4 + var 2
          mov       r13, [r12 + 32]
          add       r13, qword [r12 + 16]
          mov       [r12 + 32], r13
          ; 11: assign var 3 = var 4
          mov       r13, qword [r12 + 32]
          mov       [r12 + 24], r13
          ; 12: assign var 1 = var 2
          mov       r13, qword [r12 + 16]
          mov       [r12 + 8], r13
          ; 13: assign var 2 = var 3
          mov       r13, qword [r12 + 24]
          mov       [r12 + 16], r13
          ; 14: compare var 2 >= const 4000000
          mov       r13, [r12 + 16]
          mov       r14, 4000000
          cmp       r13, r14
          jl        j16
          ; 15: jump end
          jmp       j22
j16:                
          ; 17: assign var 5 = var 2
          mov       r13, qword [r12 + 16]
          mov       [r12 + 40], r13
          ; 18: assign var 5 % const 2
          xor       rdx, rdx
          mov       r13, 2
          mov       rax, [r12 + 40]
          idiv      r13
          mov       [r12 + 40], rdx
          ; 19: compare var 5 == const 0
          mov       r13, [r12 + 40]
          mov       r14, 0
          cmp       r13, r14
          jne       j21
          ; 20: assign var 0 + var 2
          mov       r13, [r12]
          add       r13, qword [r12 + 16]
          mov       [r12], r13
j21:                
          ; 21: jump start
          jmp       j6
j22:                
          ; 23: os stdout var 0
          push      rbx
          lea       rdi, [rel message]
          mov       rsi, qword [r12]
          call      _printf
          pop       rbx
j24:                
          ret       
                    
          section   .data
message:  db        "%d", 0x0a
