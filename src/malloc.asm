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
          mov       rdi, 21
          call      _malloc
          pop       rbx
          mov       r12, rax
j0:                 
          ; 5: assign i8 160 = const 5
          mov       byte [r12 + 20], 5
          ; 6: assign f64 96 = const 6
          mov       r14, __?float64?__(6.0)
          mov       qword [r12 + 12], r14
          ; 7: assign f64 0 = const 10
          mov       r14, __?float64?__(10.0)
          mov       qword [r12], r14
          ; 8: assign f32 64 = const 5
          mov       dword [r12 + 8], __?float32?__(5.0)
          ; 9: assign f64 0 - f32 64
          cvtss2sd  xmm1, dword [r12 + 8]
          movsd     xmm0, [r12]
          subsd     xmm0, xmm1
          movsd     [r12], xmm0
          ; 10: assign f64 0 - f64 96
          movsd     xmm0, [r12]
          subsd     xmm0, qword [r12 + 12]
          movsd     [r12], xmm0
          ; 11: assign f64 0 + i8 160
          movsx     r14, byte [r12 + 20]
          cvtsi2sd  xmm1, r14
          movsd     xmm0, [r12]
          addsd     xmm0, xmm1
          movsd     [r12], xmm0
          ; 12: assign i8 160 / f64 0
          cvttsd2si r14, qword [r12]
          xor       rdx, rdx
          mov       r13, r14
          movsx     rax, byte [r12 + 20]
          idiv      r13
          mov       byte [r12 + 20], al
          ; 13: os stdout i8 160
          push      rbx
          lea       rdi, [rel formatI]
          movsx     rsi, byte [r12 + 20]
          call      _printf
          pop       rbx
j14:                
          ret       
                    
          section   .data
formatI:  db        "%d", 10, 0
formatF:  db        "%f", 10, 0
