use std::time::Instant;

pub struct PerformanceTimer {
    start: Instant,
    label: String,
}

impl PerformanceTimer {
    pub fn start<T: Into<String>>(label: T) -> PerformanceTimer {
        PerformanceTimer {
            start: Instant::now(),
            label: label.into(),
        }
    }

    pub fn elapsed_ms(&self) -> u128 {
        self.start.elapsed().as_millis()
    }

    pub fn stop(&self) -> u128 {
        let elapsed = self.elapsed_ms();
        println!("Performance: {} took {}ms", self.label, elapsed);
        elapsed
    }
}
