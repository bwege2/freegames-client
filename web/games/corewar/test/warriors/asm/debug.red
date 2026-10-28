;redcode-94
;name Debugging
;assert 1
;debug static extra
;trace on extra
;break now
        mov.i   0, 1
;trace off
        dat     #0
;debug off
;trace
        dat     #1
