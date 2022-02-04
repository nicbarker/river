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
          mov       rdi, 42
          call      _malloc
          pop       rbx
          mov       r12, rax
j0:                 
j2:                 
          ; 4: assign var 1 = const 0
          mov       qword [r12 + 8], 0
j5:                 
          ; 7: assign var 2 = var 1
          mov       r13, qword [r12 + 8]
          mov       [r12 + 16], r13
          ; 8: assign var 2 % const 3
          xor       rdx, rdx
          mov       r13, 3
          mov       rax, [r12 + 16]
          idiv      r13
          mov       [r12 + 16], rdx
          ; 10: assign var 3 = const 0
          mov       byte [r12 + 24], 0
          ; 11: compare var 2 == const 0
          mov       r13, [r12 + 16]
          mov       r14, 0
          cmp       r13, r14
          jne       j13
          ; 12: assign var 3 = const 1
          mov       byte [r12 + 24], 1
j13:                
          ; 14: assign var 4 = var 1
          mov       r13, qword [r12 + 8]
          mov       [r12 + 25], r13
          ; 15: assign var 4 % const 5
          xor       rdx, rdx
          mov       r13, 5
          mov       rax, [r12 + 25]
          idiv      r13
          mov       [r12 + 25], rdx
          ; 17: assign var 5 = const 0
          mov       byte [r12 + 33], 0
          ; 18: compare var 4 == const 0
          mov       r13, [r12 + 25]
          mov       r14, 0
          cmp       r13, r14
          jne       j20
          ; 19: assign var 5 = const 1
          mov       byte [r12 + 33], 1
j20:                
          ; 21: assign var 6 = var 3
          movsx     r13, byte [r12 + 24]
          mov       [r12 + 34], r13
          ; 22: assign var 6 || var 5
          mov       r13, [r12 + 34]
          or        r13b, byte [r12 + 33]
          mov       [r12 + 34], r13
j23:                
          ; 24: compare var 6 == const 0
          mov       r13, [r12 + 34]
          mov       r14, 0
          cmp       r13, r14
          jne       j26
          ; 25: jump end
          jmp       j27
j26:                
          ; 26: assign var 0 + var 1
          mov       r13, [r12]
          add       r13, qword [r12 + 8]
          mov       [r12], r13
j27:                
          ; 28: assign var 1 + const 1
          add       qword [r12 + 8], 1
          ; 29: compare var 1 < const 1000
          mov       r13, [r12 + 8]
          mov       r14, 1000
          cmp       r13, r14
          jge       j31
          ; 30: jump start
          jmp       j5
j31:                
j32:                
          ; 33: os stdout var 0
          push      rbx
          lea       rdi, [rel message]
          mov       rsi, qword [r12]
          call      _printf
          pop       rbx
j34:                
          ret       
                    
          section   .data
message:  db        "%d", 0x0a
