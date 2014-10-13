((nil . ((eval . (progn
                   (setq dired-omit-extensions (delete ".cps" dired-omit-extensions))
                   (add-to-list 'interpreter-mode-alist '("nodejs" . js-mode))
                   (add-to-list 'interpreter-mode-alist '("node" . js-mode))
                   (add-to-list 'auto-mode-alist '("\\.cps\\'" . css-mode))))))
 (js-mode . ((js-indent-level . 4)
             (dtrt-indent-explicit-offset t))))
